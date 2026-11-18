// Felles inn- og utdata for hooks. Bare Node-innebygde moduler.
import fs from 'node:fs';
import path from 'node:path';
import { pluginName } from './project.mjs';

/** Nødbrems: FORGE_DISABLE=1 gjør alle hooks stille. */
export function disabled() {
  return process.env.FORGE_DISABLE === '1';
}

/**
 * Leser stdin som JSON. Tom inndata gir {}. Ugyldig JSON gir { __invalid: true },
 * slik at kalleren kan være stille.
 */
export function readInput() {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch {
    return {};
  }
  if (!raw.trim()) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : { __invalid: true };
  } catch {
    return { __invalid: true };
  }
}

/** Skriver ett JSON-objekt til stdout. Synkront, slik at exit ikke kutter utdata. */
export function emit(obj) {
  fs.writeSync(1, JSON.stringify(obj));
}

export function emitContext(eventName, text) {
  emit({ hookSpecificOutput: { hookEventName: eventName, additionalContext: text } });
}

export function dataDir() {
  return process.env.CLAUDE_PLUGIN_DATA || null;
}

export function log(message) {
  try {
    const dir = dataDir();
    if (!dir) return;
    const logDir = path.join(dir, 'logs');
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, `${pluginName()}.log`), `${new Date().toISOString()} ${message}\n`);
  } catch {
    // logging må aldri feile en hook
  }
}

/**
 * Kjører en hook feil-åpent: alltid exit 0. Uventet feil logges og gir en
 * kort systemMessage. Kill-switch gir ingen utdata.
 */
export function failOpen(scriptName, fn) {
  try {
    if (!disabled()) fn();
  } catch (err) {
    log(`${scriptName}: ${err && err.stack ? err.stack : err}`);
    try {
      emit({ systemMessage: `${pluginName()}: ${scriptName} feilet, fortsetter uten sjekk.` });
    } catch {
      // ingenting mer å gjøre
    }
  }
  process.exit(0);
}
