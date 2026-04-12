import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const candidateNode22Bins = [
	'/opt/homebrew/opt/node@22/bin',
	'/usr/local/opt/node@22/bin',
];

const homebrewNode22Bin = candidateNode22Bins.find((binPath) =>
	fs.existsSync(path.join(binPath, 'node')),
);

if (!homebrewNode22Bin) {
	console.error(
		`Homebrew node@22 was not found in ${candidateNode22Bins.join(' or ')}. Install it with \`brew install node@22\` or run the command from another compatible Node 22.x runtime.`,
	);
	process.exit(1);
}

const [, , ...args] = process.argv;

if (args.length === 0) {
	console.error('Usage: node scripts/run-with-homebrew-node22.mjs <command> [args...]');
	process.exit(1);
}

const result = spawnSync(args[0], args.slice(1), {
	stdio: 'inherit',
	env: {
		...process.env,
		PATH: `${homebrewNode22Bin}:${process.env.PATH ?? ''}`,
	},
});

if (result.error) {
	console.error(result.error.message);
	process.exit(1);
}

process.exit(result.status ?? 1);
