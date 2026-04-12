import fs from 'node:fs';
import path from 'node:path';

const versionFile = path.resolve('.nvmrc');
const alternateVersionFile = path.resolve('.node-version');
const packageJsonFile = path.resolve('package.json');

if (!fs.existsSync(versionFile) || !fs.existsSync(alternateVersionFile) || !fs.existsSync(packageJsonFile)) {
	process.exit(0);
}

function parseVersion(version) {
	return version
		.replace(/^v/, '')
		.split('.')
		.map((part) => Number.parseInt(part, 10));
}

function isAtLeast(actual, minimum) {
	for (let index = 0; index < Math.max(actual.length, minimum.length); index += 1) {
		const actualPart = actual[index] ?? 0;
		const minimumPart = minimum[index] ?? 0;

		if (actualPart > minimumPart) return true;
		if (actualPart < minimumPart) return false;
	}

	return true;
}

function parseSupportedMajor(range) {
	const match = range.match(/(\d+)\./);
	return match ? Number.parseInt(match[1], 10) : null;
}

const minimumVersion = fs.readFileSync(versionFile, 'utf8').trim().replace(/^v/, '');
const alternateMinimumVersion = fs.readFileSync(alternateVersionFile, 'utf8').trim().replace(/^v/, '');
const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
const supportedRange = packageJson.engines?.node ?? '';
const supportedMajor = parseSupportedMajor(supportedRange);
const actualVersion = process.version.replace(/^v/, '');
const actualParts = parseVersion(actualVersion);
const minimumParts = parseVersion(minimumVersion);

if (supportedMajor === null) {
	console.error('Unable to determine the supported Node version range from package.json.');
	process.exit(1);
}

if (minimumVersion !== alternateMinimumVersion) {
	console.error(
		`.nvmrc (${minimumVersion}) and .node-version (${alternateMinimumVersion}) must stay in sync.`,
	);
	process.exit(1);
}

if (actualParts[0] !== supportedMajor || !isAtLeast(actualParts, minimumParts)) {
	console.error(
		`Node ${supportedMajor}.x >= ${minimumVersion} is required for this repo. Current version: ${actualVersion}. Run \`nvm use\` or switch your Node version manager to a compatible ${supportedMajor}.x release.`,
	);
	process.exit(1);
}
