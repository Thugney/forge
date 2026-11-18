import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const realPluginRoot = path.join(repoRoot, 'plugins', 'forge');
export const scriptsDir = path.join(realPluginRoot, 'scripts');

export function tmp(prefix = 'forge-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export const FIXTURE_CATALOG = {
  catalogVersion: 'test',
  controls: [
    { id: 'DP-01', triggers: ['personal-data'], map: { gdpr: ['5'] } },
    { id: 'DP-02', triggers: ['personal-data', 'feature'], map: { gdpr: ['25'], iso27001: ['A.5.34'] } },
    { id: 'AC-03', triggers: ['db-schema'], map: { gdpr: ['32'] }, appliesWhen: { profile: 'datastore.rls.required' } },
    { id: 'AU-01', triggers: ['auth'], map: { iso27001: ['A.8.5'] } },
    { id: 'HP-01', triggers: ['personal-data'], map: { hipaa: ['164'] }, appliesWhen: { framework: 'hipaa' } },
    { id: 'GEN-01', triggers: ['always'] },
  ],
};

/** Lager en falsk plugin-rot med plugin.json og en liten katalog. */
export function makePluginRoot({ name = 'forge', catalog = FIXTURE_CATALOG } = {}) {
  const dir = tmp('forge-plugin-');
  fs.mkdirSync(path.join(dir, '.claude-plugin'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude-plugin', 'plugin.json'), JSON.stringify({ name, version: '9.9.9' }));
  if (catalog !== null) {
    fs.mkdirSync(path.join(dir, 'catalog'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'catalog', 'controls.json'),
      typeof catalog === 'string' ? catalog : JSON.stringify(catalog),
    );
  }
  return dir;
}

export function makeRepo({ git = true, enrolled = false, files = {}, frameworks = [], profile = null } = {}) {
  const dir = tmp('forge-repo-');
  if (git) spawnSync('git', ['init', '-q'], { cwd: dir });
  if (enrolled) {
    fs.writeFileSync(path.join(dir, 'forge.json'), JSON.stringify({ enrolled: '2026-11-18', forgeVersion: '9.9.9', frameworks }));
  }
  if (profile) {
    fs.mkdirSync(path.join(dir, 'compliance'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'compliance', 'profile.json'), JSON.stringify(profile));
  }
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

/** Kjører et skript som en hook: stdin-JSON (eller rå tekst), miljø og tidtaking. */
export function runScript(script, { input, project, pluginRoot, dataDir, env = {}, args = [] } = {}) {
  const e = { ...process.env, ...env };
  delete e.FORGE_DISABLE;
  Object.assign(e, env);
  if (project) e.CLAUDE_PROJECT_DIR = project;
  if (pluginRoot) e.CLAUDE_PLUGIN_ROOT = pluginRoot;
  if (dataDir) e.CLAUDE_PLUGIN_DATA = dataDir;
  const stdin = input === undefined ? '' : typeof input === 'string' ? input : JSON.stringify(input);
  const t0 = process.hrtime.bigint();
  const r = spawnSync(process.execPath, [path.join(scriptsDir, script), ...args], {
    input: stdin, encoding: 'utf8', env: e, cwd: project || undefined,
  });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, ms };
}

export function context(r) {
  if (!r.stdout) return null;
  return JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
}

export function p95(values) {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil(s.length * 0.95) - 1)];
}
