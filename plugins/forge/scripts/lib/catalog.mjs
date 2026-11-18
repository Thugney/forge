// Kontrollkatalogen. Mangler filen eller er den ugyldig, gir alt [] uten å krasje.
import path from 'node:path';
import { pluginRoot, readJsonSafe } from './project.mjs';

export function loadCatalog() {
  const cat = readJsonSafe(path.join(pluginRoot(), 'catalog', 'controls.json'));
  if (!cat || !Array.isArray(cat.controls)) return [];
  return cat.controls.filter((c) => c && typeof c === 'object' && typeof c.id === 'string');
}

function getPath(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);
}

function conditionHolds(control, frameworks, profile) {
  const w = control.appliesWhen;
  if (!w || typeof w !== 'object') return true;
  if (typeof w.framework === 'string' && !frameworks.includes(w.framework.toLowerCase())) return false;
  // Uten profil kjenner vi ikke betingelsen; da tas kontrollen med (billigere å melde for mye).
  if (typeof w.profile === 'string' && profile) return Boolean(getPath(profile, w.profile));
  return true;
}

/**
 * Kontroller som er på for merkene og rammeverkene.
 * På når en trigger treffer merkene (eller er 'always'), kartet peker på minst
 * ett rammeverk som er på (eller mangler), og appliesWhen holder.
 */
export function activeControls(tags, frameworks, profile = null, controls = loadCatalog()) {
  const tagSet = new Set(tags || []);
  const fw = (frameworks || []).map((f) => String(f).toLowerCase());
  return controls.filter((c) => {
    const triggers = Array.isArray(c.triggers) ? c.triggers : [];
    if (!triggers.includes('always') && !triggers.some((t) => tagSet.has(t))) return false;
    const mapKeys = c.map && typeof c.map === 'object' ? Object.keys(c.map).map((k) => k.toLowerCase()) : [];
    if (mapKeys.length > 0 && !mapKeys.some((k) => fw.includes(k))) return false;
    return conditionHolds(c, fw, profile);
  });
}

export function activeControlIds(tags, frameworks, profile = null, controls = loadCatalog()) {
  return activeControls(tags, frameworks, profile, controls).map((c) => c.id);
}
