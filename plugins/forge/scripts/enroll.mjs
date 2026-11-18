// Melder prosjektet inn: lager forge.json i git-roten. Idempotent.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pluginVersion } from './lib/project.mjs';

function out(text) {
  process.stdout.write(`${text}\n`);
}

function localDate() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function gitRoot(cwd) {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' });
  if (r.error || r.status !== 0) return null;
  const p = r.stdout.trim();
  return p ? path.resolve(p) : null;
}

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const root = gitRoot(cwd);
if (!root) {
  out('Kan ikke melde inn: mappen er ikke et git-repo. Kjør git init først, eller åpne prosjektmappen.');
  process.exit(1);
}

const file = path.join(root, 'forge.json');
if (fs.existsSync(file)) {
  out(`Prosjektet er allerede meldt inn (${file}). Ingenting er endret.`);
  process.exit(0);
}

const data = { enrolled: localDate(), forgeVersion: pluginVersion(), frameworks: [] };
fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
out(`Prosjektet er meldt inn. Laget ${file}.`);
process.exit(0);
