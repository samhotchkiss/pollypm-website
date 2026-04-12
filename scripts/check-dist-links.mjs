import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

function walk(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk(fullPath));
			continue;
		}
		files.push(fullPath);
	}

	return files;
}

function stripFragmentAndQuery(target) {
	return target.split('#')[0].split('?')[0];
}

function resolveLinkPath(htmlPath, target) {
	const cleanTarget = stripFragmentAndQuery(target);
	if (!cleanTarget || cleanTarget === '.') {
		return htmlPath;
	}

	return path.resolve(path.dirname(htmlPath), cleanTarget);
}

function isExternalTarget(target) {
	return /^(https?:|mailto:|tel:|data:)/.test(target);
}

function main() {
	if (!fs.existsSync(distDir)) {
		console.error('dist/ does not exist. Run `npm run build` first.');
		process.exit(1);
	}

	const htmlFiles = walk(distDir).filter((file) => file.endsWith('.html'));
	const issues = [];

	for (const htmlPath of htmlFiles) {
		const html = fs.readFileSync(htmlPath, 'utf8');
		const matches = html.matchAll(/(?:href|src)="([^"]+)"/g);

		for (const match of matches) {
			const target = match[1];

			if (
				!target ||
				target.startsWith('#') ||
				isExternalTarget(target)
			) {
				continue;
			}

			const resolvedPath = resolveLinkPath(htmlPath, target);
			if (!fs.existsSync(resolvedPath)) {
				const relativeHtmlPath = path.relative(process.cwd(), htmlPath);
				issues.push(`${relativeHtmlPath}: missing target ${target}`);
			}
		}
	}

	if (issues.length > 0) {
		console.error('Broken built links/assets found:');
		for (const issue of issues) {
			console.error(`- ${issue}`);
		}
		process.exit(1);
	}

	console.log(`Verified ${htmlFiles.length} built HTML files: all local href/src targets exist.`);
}

main();
