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

function toFileTarget(rootPath) {
	if (rootPath === '' || rootPath === '/') {
		return 'index.html';
	}

	const [pathnameWithQuery, hash = ''] = rootPath.split('#');
	const [pathname, query = ''] = pathnameWithQuery.split('?');
	const cleaned = pathname.replace(/^\/+/, '').replace(/\/+$/, '');

	let filePath = cleaned;
	if (!path.posix.extname(cleaned)) {
		filePath = cleaned ? `${cleaned}/index.html` : 'index.html';
	}

	let suffix = '';
	if (query) suffix += `?${query}`;
	if (hash) suffix += `#${hash}`;
	return `${filePath}${suffix}`;
}

function rewriteHtml(htmlPath) {
	const html = fs.readFileSync(htmlPath, 'utf8');
	const currentDir = path.dirname(htmlPath);

	const updated = html.replace(/(href|src)="\/([^"]*)"/g, (_, attr, target) => {
		const relativeTarget = path
			.relative(currentDir, path.join(distDir, toFileTarget(`/${target}`)))
			.split(path.sep)
			.join('/');

		return `${attr}="${relativeTarget || '.'}"`;
	});

	fs.writeFileSync(htmlPath, updated);
}

for (const file of walk(distDir)) {
	if (file.endsWith('.html')) {
		rewriteHtml(file);
	}
}
