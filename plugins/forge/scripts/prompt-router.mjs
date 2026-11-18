// UserPromptSubmit: ruter meldingen til riktige skills og kontroller. Stille i prosjekter som ikke er meldt inn.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readInput, emitContext, failOpen, dataDir } from './lib/io.mjs';
import {
  findProjectRoot, isEnrolled, readEnrollment, readProfile, enabledFrameworks, pluginName,
} from './lib/project.mjs';
import { classify } from './lib/classify.mjs';
import { activeControlIds } from './lib/catalog.mjs';

const MAX_CHARS = 1200;
const GATE_TAGS = ['feature', 'personal-data', 'db-schema', 'api', 'auth', 'logging', 'third-party', 'ai', 'deps', 'infra'];
const NEW_PROJECT = /(nytt prosjekt|new project|start(e|er)? (et|ett) (nytt )?prosjekt|start(ing)? a (new )?project|begynne p[åa] et nytt prosjekt)/;

function sessionStatePath(sessionId) {
  const safe = String(sessionId || 'unknown').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80);
  const base = dataDir() || path.join(os.tmpdir(), `${pluginName()}-data`);
  return path.join(base, 'state', `${safe}.json`);
}

/** Foreslår innmelding høyst én gang per økt. Returnerer true første gang. */
function firstEnrollSuggestion(sessionId) {
  const file = sessionStatePath(sessionId);
  let state = {};
  try {
    state = JSON.parse(fs.readFileSync(file, 'utf8')) || {};
  } catch {
    state = {};
  }
  if (state.enrollSuggested) return false;
  state.enrollSuggested = true;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(state));
  } catch {
    // Kan vi ikke lagre, er det tryggere å tie enn å mase.
    return false;
  }
  return true;
}

function buildText(name, tags, controlIds, hasFrameworks) {
  const lines = [];
  const lead = tags.length ? `[${name}] Treff: ${tags.join(', ')}.` : `[${name}]`;
  lines.push(lead);
  let n = 1;
  const add = (t) => lines.push(`${n++}. ${t}`);
  if (tags.includes('ui')) {
    add('UI: last skills `ui-ux-pro-max` og `impeccable` før du skriver UI-kode.');
  }
  if (tags.some((t) => GATE_TAGS.includes(t))) {
    add(`Krav: last skill \`${name}:compliance-guard\` i modus gate FØR du skriver spec eller kode.`);
    if (controlIds.length) {
      let shown = controlIds;
      let extra = '';
      if (controlIds.length > 14) {
        shown = controlIds.slice(0, 14);
        extra = ` (+${controlIds.length - 14} til)`;
      }
      lines.push(`   Aktive kontroller: ${shown.join(', ')}${extra}.`);
    } else if (!hasFrameworks) {
      lines.push('   Ingen rammeverk er valgt ennå; de velges i fase Krav.');
    }
  }
  add(`Modell: følg \`${name}:model-router\`. Si fra én gang hvis økten står på feil modell.`);
  if (tags.includes('feature')) add('Spec først: ingen kode før eieren har godkjent omfanget.');
  let text = lines.join('\n');
  if (text.length > MAX_CHARS) text = `${text.slice(0, MAX_CHARS - 1)}…`;
  return text;
}

failOpen('prompt-router', () => {
  const input = readInput();
  if (input.__invalid) return;
  const prompt = typeof input.prompt === 'string' ? input.prompt : '';
  if (!prompt.trim()) return;
  const name = pluginName();
  const root = findProjectRoot(input);

  if (!isEnrolled(root)) {
    if (NEW_PROJECT.test(prompt.toLowerCase()) && firstEnrollSuggestion(input.session_id)) {
      emitContext('UserPromptSubmit',
        `[${name}] Dette ser ut som et nytt prosjekt. Foreslå for eieren å melde det inn med /${name}:enroll (valgfritt, én gang).`);
    }
    return;
  }

  if (prompt.trimStart().startsWith('/')) return;

  const tags = classify(prompt);
  const enrollment = readEnrollment(root);
  const profile = readProfile(root);
  const frameworks = enabledFrameworks(enrollment, profile);
  const gate = tags.some((t) => GATE_TAGS.includes(t));
  const ids = gate ? activeControlIds(tags, frameworks, profile) : [];
  emitContext('UserPromptSubmit', buildText(name, tags, ids, frameworks.length > 0));
});
