// SessionStart: stille i prosjekter som ikke er meldt inn. Ellers et kort sammendrag.
import fs from 'node:fs';
import path from 'node:path';
import { readInput, emitContext, failOpen } from './lib/io.mjs';
import {
  findProjectRoot, isEnrolled, readEnrollment, readProfile, enabledFrameworks, pluginName,
} from './lib/project.mjs';

const CODE_FILES = ['package.json', 'pyproject.toml', 'go.mod'];
const CODE_DIRS = ['src', 'migrations', 'db', 'supabase', 'prisma'];

/** Tomt repo: ingen package.json, pyproject.toml, go.mod, *.csproj, src/ eller migrasjonsmappe. */
function hasCode(root) {
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return false;
  }
  for (const e of entries) {
    if (e.isFile() && (CODE_FILES.includes(e.name) || e.name.endsWith('.csproj'))) return true;
    if (e.isDirectory() && CODE_DIRS.includes(e.name)) {
      if (e.name === 'src' || e.name === 'migrations') return true;
      // db/, supabase/, prisma/ teller bare hvis de har en migrasjonsmappe
      if (fs.existsSync(path.join(root, e.name, 'migrations'))) return true;
    }
  }
  return false;
}

failOpen('session-start', () => {
  const input = readInput();
  if (input.__invalid) return;
  const root = findProjectRoot(input);
  if (!isEnrolled(root)) return;

  const name = pluginName();
  const enrollment = readEnrollment(root);
  const profile = readProfile(root);
  const frameworks = enabledFrameworks(enrollment, profile);

  const lines = [`[${name}] Prosjektet er meldt inn${enrollment.enrolled ? ` (${enrollment.enrolled})` : ''}.`];
  lines.push(`Rammeverk: ${frameworks.length ? frameworks.join(', ') : 'ingen valgt ennå'}. Profil: ${profile ? 'finnes (compliance/profile.json)' : 'finnes ikke'}.`);
  if (!profile) {
    lines.push(hasCode(root)
      ? `Kjør baseline før du endrer noe. Bruk skill \`${name}:compliance-guard\` i modus baseline.`
      : 'Start i fase Plan, så init i fase Krav.');
  }
  emitContext('SessionStart', lines.join('\n'));
});
