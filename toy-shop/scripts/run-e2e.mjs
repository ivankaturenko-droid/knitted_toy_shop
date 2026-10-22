import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectDirectory = path.dirname(
  path.dirname(fileURLToPath(import.meta.url))
);
const vitePath = path.join(
  projectDirectory,
  'node_modules',
  'vite',
  'bin',
  'vite.js'
);
const cypressPath = path.join(
  projectDirectory,
  'node_modules',
  'cypress',
  'bin',
  'cypress'
);
const vite = spawn(
  process.execPath,
  [vitePath, '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  { cwd: projectDirectory, stdio: 'inherit', windowsHide: true }
);

async function waitForVite() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (vite.exitCode !== null) {
      throw new Error(`Vite завершив роботу з кодом ${vite.exitCode}.`);
    }
    try {
      const response = await fetch('http://127.0.0.1:4173');
      if (response.ok) return;
    } catch {
      await delay(250);
    }
  }
  throw new Error('Не вдалося запустити Vite для E2E-тестів.');
}

let exitCode = 1;

try {
  await waitForVite();
  const cypress = spawn(
    process.execPath,
    [cypressPath, 'run', '--e2e', '--config-file', 'cypress.config.js'],
    { cwd: projectDirectory, stdio: 'inherit', windowsHide: true }
  );
  const [code] = await once(cypress, 'exit');
  exitCode = code ?? 1;
} finally {
  if (vite.exitCode === null) {
    const viteExit = once(vite, 'exit');
    vite.kill();
    await Promise.race([viteExit, delay(3000)]);
  }
}

process.exitCode = exitCode;
