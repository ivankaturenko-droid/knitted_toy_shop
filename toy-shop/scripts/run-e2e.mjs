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
const jsonServerPath = path.join(
  projectDirectory,
  'node_modules',
  'json-server',
  'lib',
  'bin.js'
);
const cypressPath = path.join(
  projectDirectory,
  'node_modules',
  'cypress',
  'bin',
  'cypress'
);
let vite;
let jsonServer;

async function waitForService(url, processHandle, label) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (processHandle && processHandle.exitCode !== null) {
      throw new Error(
        `${label} завершив роботу з кодом ${processHandle.exitCode}.`
      );
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await delay(250);
    }
  }
  throw new Error(`Не вдалося запустити ${label} для E2E-тестів.`);
}

async function stopProcess(processHandle) {
  if (!processHandle || processHandle.exitCode !== null) return;
  const processExit = once(processHandle, 'exit');
  processHandle.kill();
  await Promise.race([processExit, delay(3000)]);
}

let exitCode = 1;

try {
  try {
    const response = await fetch('http://127.0.0.1:3000/products');
    if (!response.ok) throw new Error('JSON Server відповів помилкою.');
  } catch {
    jsonServer = spawn(
      process.execPath,
      [jsonServerPath, 'db.json', '--port', '3000'],
      { cwd: projectDirectory, stdio: 'inherit', windowsHide: true }
    );
    await waitForService(
      'http://127.0.0.1:3000/products',
      jsonServer,
      'JSON Server'
    );
  }

  vite = spawn(
    process.execPath,
    [vitePath, '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
    { cwd: projectDirectory, stdio: 'inherit', windowsHide: true }
  );
  await waitForService('http://127.0.0.1:4173', vite, 'Vite');
  const cypress = spawn(
    process.execPath,
    [cypressPath, 'run', '--e2e', '--config-file', 'cypress.config.js'],
    { cwd: projectDirectory, stdio: 'inherit', windowsHide: true }
  );
  const [code] = await once(cypress, 'exit');
  exitCode = code ?? 1;
} finally {
  await stopProcess(vite);
  await stopProcess(jsonServer);
}

process.exitCode = exitCode;
