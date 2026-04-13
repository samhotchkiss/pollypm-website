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

function compareVersions(left, right) {
	for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
		const leftPart = left[index] ?? 0;
		const rightPart = right[index] ?? 0;

		if (leftPart > rightPart) return 1;
		if (leftPart < rightPart) return -1;
	}

	return 0;
}

function parseSupportedRange(range) {
	const constraints = range
		.split(/\s+/)
		.map((constraint) => constraint.trim())
		.filter(Boolean)
		.map((constraint) => {
			const match = constraint.match(/^(>=|>|<=|<|=)?v?(\d+(?:\.\d+)*)$/);

			if (!match) return null;

			return {
				operator: match[1] ?? '=',
				version: parseVersion(match[2]),
			};
		});

	if (constraints.length === 0 || constraints.some((constraint) => constraint === null)) {
		return null;
	}

	return constraints;
}

function satisfiesRange(actual, constraints) {
	return constraints.every(({ operator, version }) => {
		const comparison = compareVersions(actual, version);

		switch (operator) {
			case '>':
				return comparison > 0;
			case '>=':
				return comparison >= 0;
			case '<':
				return comparison < 0;
			case '<=':
				return comparison <= 0;
			case '=':
				return comparison === 0;
			default:
				return false;
		}
	});
}

const minimumVersion = fs.readFileSync(versionFile, 'utf8').trim().replace(/^v/, '');
const alternateMinimumVersion = fs.readFileSync(alternateVersionFile, 'utf8').trim().replace(/^v/, '');
const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
const supportedRange = packageJson.engines?.node ?? '';
const supportedConstraints = parseSupportedRange(supportedRange);
const supportedMajor = supportedConstraints?.find(({ operator }) => operator === '>=' || operator === '=')?.version[0] ?? null;
const actualVersion = process.version.replace(/^v/, '');
const actualParts = parseVersion(actualVersion);
const minimumParts = parseVersion(minimumVersion);

if (!supportedRange || supportedConstraints === null || supportedMajor === null) {
	console.error('Unable to determine the supported Node version range from package.json.');
	process.exit(1);
}

if (minimumVersion !== alternateMinimumVersion) {
	console.error(
		`.nvmrc (${minimumVersion}) and .node-version (${alternateMinimumVersion}) must stay in sync.`,
	);
	process.exit(1);
}

if (!satisfiesRange(actualParts, supportedConstraints) || !isAtLeast(actualParts, minimumParts)) {
	console.error(
		`Node ${supportedRange} is required for this repo. Current version: ${actualVersion}. Run \`nvm use\` or switch your Node version manager to a compatible ${supportedMajor}.x release.`,
	);
	process.exit(1);
}
