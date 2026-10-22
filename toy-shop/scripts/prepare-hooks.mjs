import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import husky from 'husky';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const gitRoot = spawnSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: projectDirectory,
  encoding: 'utf8',
});

if (gitRoot.status !== 0) {
  throw new Error('Не вдалося визначити Git-репозиторій для Husky.');
}

const rootDirectory = gitRoot.stdout.trim();
if (
  path.resolve(rootDirectory) !== projectDirectory ||
  !existsSync(path.join(projectDirectory, '.git'))
) {
  console.log(
    'Husky pre-commit підготовлено, але не активовано: toy-shop вкладений у Git-репозиторій. Щоб зберегти файли поза toy-shop незмінними, core.hooksPath не змінюється.'
  );
} else {
  const result = husky('.husky');
  if (result) throw new Error(result);
}
