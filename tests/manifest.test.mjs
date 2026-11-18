import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

test('marketplace lists the plugin at an existing relative path', () => {
  const mp = readJson('.claude-plugin/marketplace.json');
  assert.equal(typeof mp.name, 'string');
  assert.ok(mp.owner && mp.owner.name);
  assert.ok(Array.isArray(mp.plugins) && mp.plugins.length > 0);
  for (const p of mp.plugins) {
    assert.ok(p.source.startsWith('./'), `relative source: ${p.source}`);
    assert.ok(fs.existsSync(path.join(root, p.source, '.claude-plugin', 'plugin.json')));
  }
});

test('plugin name matches marketplace entry and folder name', () => {
  const mp = readJson('.claude-plugin/marketplace.json');
  for (const entry of mp.plugins) {
    const manifest = readJson(path.join(entry.source, '.claude-plugin', 'plugin.json'));
    assert.equal(manifest.name, entry.name);
    assert.equal(path.basename(entry.source), entry.name);
  }
});

test('hooks.json only references scripts that exist, in exec form', () => {
  const hooks = readJson('plugins/forge/hooks/hooks.json').hooks;
  for (const [event, groups] of Object.entries(hooks)) {
    for (const g of groups) {
      for (const h of g.hooks) {
        assert.equal(h.type, 'command', event);
        assert.equal(h.command, 'node', `${event}: exec form with node`);
        const script = h.args[0].replace('${CLAUDE_PLUGIN_ROOT}', path.join(root, 'plugins/forge'));
        assert.ok(fs.existsSync(script), `${event}: ${script}`);
      }
    }
  }
});

test('workflow actions are pinned to a full commit SHA', () => {
  const dir = path.join(root, '.github/workflows');
  for (const f of fs.readdirSync(dir)) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of text.matchAll(/uses:\s*([^\s#]+)/g)) {
      assert.match(m[1], /@[0-9a-f]{40}$/, `${f}: ${m[1]}`);
    }
  }
});
