// CLI: node catalog-query.mjs --tags a,b --frameworks gdpr,iso27001
// Skriver matchende kontroller som JSON. Brukes av skills.
import { activeControls } from './lib/catalog.mjs';
import { findProjectRoot, readProfile } from './lib/project.mjs';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0 || !process.argv[i + 1]) return [];
  return process.argv[i + 1].split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
}

try {
  const tags = arg('tags');
  const frameworks = arg('frameworks');
  const profile = readProfile(findProjectRoot({}));
  process.stdout.write(`${JSON.stringify(activeControls(tags, frameworks, profile), null, 2)}\n`);
} catch {
  process.stdout.write('[]\n');
}
process.exit(0);
