// Prosjektrot, innmelding, profil og pluginnavn. Navnet leses alltid fra plugin.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function pluginRoot() {
  if (process.env.CLAUDE_PLUGIN_ROOT) return process.env.CLAUDE_PLUGIN_ROOT;
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
}

export function readJsonSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

export function pluginManifest() {
  return readJsonSafe(path.join(pluginRoot(), '.claude-plugin', 'plugin.json')) || {};
}

export function pluginName() {
  const n = pluginManifest().name;
  return typeof n === 'string' && n ? n : 'plugin';
}

export function pluginVersion() {
  const v = pluginManifest().version;
  return typeof v === 'string' ? v : 'unknown';
}

const ENROLL_FILE = 'forge.json';

/**
 * Prosjektrot: CLAUDE_PROJECT_DIR, ellers cwd fra inndata, ellers process.cwd().
 * Går opp til nærmeste mappe med forge.json (høyst 8 nivåer); finnes ingen, brukes startmappen.
 */
export function findProjectRoot(input) {
  const start = path.resolve(
    process.env.CLAUDE_PROJECT_DIR || (input && typeof input.cwd === 'string' && input.cwd) || process.cwd(),
  );
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, ENROLL_FILE))) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return start;
}

export function isEnrolled(root) {
  return fs.existsSync(path.join(root, ENROLL_FILE));
}

export function readEnrollment(root) {
  const v = readJsonSafe(path.join(root, ENROLL_FILE));
  return v && typeof v === 'object' ? v : {};
}

export function readProfile(root) {
  return readJsonSafe(path.join(root, 'compliance', 'profile.json'));
}

/** Rammeverk som er på: forge.json sin liste pluss profilens frameworks som er true. */
export function enabledFrameworks(enrollment, profile) {
  const set = new Set();
  if (enrollment && Array.isArray(enrollment.frameworks)) {
    for (const f of enrollment.frameworks) if (typeof f === 'string') set.add(f.toLowerCase());
  }
  if (profile && profile.frameworks && typeof profile.frameworks === 'object') {
    for (const [k, v] of Object.entries(profile.frameworks)) if (v === true) set.add(k.toLowerCase());
  }
  return [...set];
}
