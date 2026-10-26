import { createServer } from 'vite';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const electronPath = require('electron');

console.log('[dev] compiling electron main process...');
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.electron.json'], {
  stdio: 'inherit',
});

const server = await createServer();
await server.listen();
const url = server.resolvedUrls?.local?.[0] ?? 'http://localhost:5273/';
console.log(`[dev] renderer at ${url}`);

const child = spawn(electronPath, ['.'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_DEV_SERVER_URL: url },
});

child.on('close', async () => {
  await server.close();
  process.exit(0);
});
