// Ordlistetreff på norsk og engelsk. Små bokstaver, ordstammer, æøå.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TAGS = ['ui', 'feature', 'personal-data', 'db-schema', 'api', 'auth', 'logging', 'third-party', 'ai', 'deps', 'infra'];

let cache = null;
function keywords() {
  if (!cache) {
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'keywords.json');
    cache = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return cache;
}

// Ord = bokstaver og tall (Unicode, så æøå virker), med bindestrek, punktum og skråstrek inni ord.
function tokenize(text) {
  return text.match(/[\p{L}\p{N}]+(?:[-./][\p{L}\p{N}]+)*/gu) || [];
}

/** Returnerer merkene (i fast rekkefølge) som meldingen treffer. */
export function classify(prompt) {
  if (typeof prompt !== 'string' || !prompt.trim()) return [];
  const text = prompt.toLowerCase().normalize('NFC');
  const tokens = tokenize(text);
  const words = new Set(tokens);
  // Delord i sammensatte ord (e-post, rull-ut) prøves også.
  for (const t of tokens) for (const p of t.split(/[-./]/)) if (p) words.add(p);
  const list = [...words];
  const kw = keywords();
  const hits = [];
  for (const tag of TAGS) {
    const def = kw[tag];
    if (!def) continue;
    const exact = new Set(def.exact || []);
    const prefixes = (def.prefix || []).filter((p) => !p.includes(' '));
    const phrases = [...(def.phrases || []), ...(def.prefix || []).filter((p) => p.includes(' '))];
    let hit = list.some((w) => exact.has(w) || prefixes.some((p) => w.startsWith(p)));
    if (!hit) hit = phrases.some((p) => text.includes(p));
    if (hit) hits.push(tag);
  }
  return hits;
}
