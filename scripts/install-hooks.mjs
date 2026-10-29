import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync } from 'node:fs';
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
if (existsSync('.git') && git('branch', '--show-current') === 'develop') {
  let current = '';
  try { current = git('config', '--local', '--get', 'core.hooksPath'); } catch {}
  if (current && current !== '.githooks') throw new Error('Existing hooksPath preserved; integrate the SorriMed pre-push hook before publishing.');
  if (!current && existsSync('.git/hooks/pre-push')) throw new Error('Existing pre-push hook preserved; integrate it before publishing.');
  chmodSync('.githooks/pre-push', 0o755);
  git('config', '--local', 'core.hooksPath', '.githooks');
  console.log('SorriMed: develop pushes automatically build/test a production review branch.');
}
