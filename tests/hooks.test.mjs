import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { makePluginRoot, makeRepo, tmp, runScript, context, p95, scriptsDir, realPluginRoot } from './helpers.mjs';

const prompt = (text, extra = {}) => ({ hook_event_name: 'UserPromptSubmit', session_id: 's1', prompt: text, ...extra });

function setup(opts = {}) {
  return {
    pluginRoot: makePluginRoot(opts.plugin),
    dataDir: tmp('forge-data-'),
    project: makeRepo(opts.repo),
  };
}

// ---------- fail open ----------

for (const script of ['session-start.mjs', 'prompt-router.mjs']) {
  test(`${script}: broken JSON on stdin gives exit 0 and no stdout`, () => {
    const s = setup({ repo: { enrolled: true } });
    const r = runScript(script, { ...s, input: '{not json' });
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  });

  test(`${script}: not enrolled gives no output`, () => {
    const s = setup();
    const r = runScript(script, { ...s, input: prompt('legg til et skjema for kunden') });
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  });

  test(`${script}: not a git repo and not enrolled gives no output`, () => {
    const s = setup({ repo: { git: false } });
    const r = runScript(script, { ...s, input: prompt('legg til et skjema for kunden') });
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  });

  test(`${script}: FORGE_DISABLE=1 is a kill switch`, () => {
    const s = setup({ repo: { enrolled: true } });
    const r = runScript(script, { ...s, input: prompt('legg til et skjema'), env: { FORGE_DISABLE: '1' } });
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  });
}

test('a catalog path that is a directory is tolerated', () => {
  const s = setup({ repo: { enrolled: true } });
  // Katalogen er en mappe i stedet for en fil: lastingen skal tåles, ikke krasje.
  fs.rmSync(path.join(s.pluginRoot, 'catalog', 'controls.json'));
  fs.mkdirSync(path.join(s.pluginRoot, 'catalog', 'controls.json'));
  const r = runScript('prompt-router.mjs', { ...s, input: prompt('legg til et skjema for kunden') });
  assert.equal(r.status, 0);
  assert.match(context(r), /^\[forge\]/);
});

// ---------- session-start ----------

test('session-start: enrolled without profile in a repo with code asks for baseline', () => {
  const s = setup({ repo: { enrolled: true, files: { 'package.json': '{}' } } });
  const r = runScript('session-start.mjs', { ...s, input: { source: 'startup' } });
  assert.equal(r.status, 0);
  const c = context(r);
  assert.match(c, /meldt inn \(2026-11-18\)/);
  assert.match(c, /Profil: finnes ikke/);
  assert.match(c, /Kjør baseline før du endrer noe\. Bruk skill `forge:compliance-guard` i modus baseline\./);
});

test('session-start: enrolled without profile in an empty repo starts in Plan', () => {
  const s = setup({ repo: { enrolled: true, files: { 'README.md': '# hei' } } });
  const c = context(runScript('session-start.mjs', { ...s, input: {} }));
  assert.match(c, /Start i fase Plan, så init i fase Krav\./);
  assert.doesNotMatch(c, /baseline/);
});

test('session-start: with profile shows frameworks and no baseline nag', () => {
  const s = setup({
    repo: { enrolled: true, files: { 'src/a.ts': '' }, profile: { frameworks: { gdpr: true, hipaa: false } } },
  });
  const c = context(runScript('session-start.mjs', { ...s, input: {} }));
  assert.match(c, /Rammeverk: gdpr\./);
  assert.match(c, /Profil: finnes/);
  assert.doesNotMatch(c, /baseline/);
});

test('session-start: input cwd is used when CLAUDE_PROJECT_DIR is missing', () => {
  const project = makeRepo({ enrolled: true });
  const s = { pluginRoot: makePluginRoot(), dataDir: tmp() };
  const r = runScript('session-start.mjs', { ...s, input: { cwd: project }, env: { CLAUDE_PROJECT_DIR: '' } });
  assert.match(context(r), /meldt inn/);
});

// ---------- prompt-router ----------

test('prompt-router: enrolled repo gets [forge] text in the spec style', () => {
  const s = setup({ repo: { enrolled: true, frameworks: ['gdpr', 'iso27001'], profile: { datastore: { rls: { required: true } } } } });
  const r = runScript('prompt-router.mjs', { ...s, input: prompt('legg til et skjema der kunden kan endre telefonnummeret sitt') });
  assert.equal(r.status, 0);
  const c = context(r);
  assert.match(c, /^\[forge\] Treff: ui, feature, personal-data\./);
  assert.match(c, /1\. UI: last skills `ui-ux-pro-max` og `impeccable`/);
  assert.match(c, /2\. Krav: last skill `forge:compliance-guard` i modus gate FØR/);
  assert.match(c, /Aktive kontroller: DP-01, DP-02, GEN-01\./);
  assert.match(c, /3\. Modell: følg `forge:model-router`/);
  assert.match(c, /4\. Spec først: ingen kode før eieren har godkjent omfanget\./);
  assert.ok(c.length <= 1200);
});

test('prompt-router: framework and profile conditions shape the control list', () => {
  const withRls = setup({ repo: { enrolled: true, frameworks: ['gdpr'], profile: { datastore: { rls: { required: true } } } } });
  assert.match(context(runScript('prompt-router.mjs', { ...withRls, input: prompt('ny tabell') })), /AC-03/);
  const noRls = setup({ repo: { enrolled: true, frameworks: ['gdpr'], profile: { datastore: { rls: { required: false } } } } });
  assert.doesNotMatch(context(runScript('prompt-router.mjs', { ...noRls, input: prompt('ny tabell') })), /AC-03/);
  const hipaa = setup({ repo: { enrolled: true, frameworks: ['hipaa'] } });
  assert.match(context(runScript('prompt-router.mjs', { ...hipaa, input: prompt('vis pasienten') })), /HP-01/);
});

test('prompt-router: short reply without hits gives only the model line', () => {
  const s = setup({ repo: { enrolled: true } });
  const c = context(runScript('prompt-router.mjs', { ...s, input: prompt('ja') }));
  assert.match(c, /^\[forge\]/);
  assert.match(c, /Modell: følg `forge:model-router`/);
  assert.doesNotMatch(c, /compliance-guard|ui-ux-pro-max|Spec først/);
});

test('prompt-router: slash commands are skipped', () => {
  const s = setup({ repo: { enrolled: true } });
  const r = runScript('prompt-router.mjs', { ...s, input: prompt('/forge:enroll') });
  assert.equal(r.stdout, '');
});

test('prompt-router: output stays under 1200 characters with a huge catalog', () => {
  const controls = Array.from({ length: 80 }, (_, i) => ({ id: `ZZ-${String(i).padStart(3, '0')}`, triggers: ['always'] }));
  const s = setup({ plugin: { catalog: { controls } }, repo: { enrolled: true } });
  const c = context(runScript('prompt-router.mjs', { ...s, input: prompt('legg til et skjema for kunden med innlogging') }));
  assert.ok(c.length <= 1200, `length ${c.length}`);
});

test('prompt-router: missing or invalid catalog still routes, with no control ids', () => {
  for (const catalog of [null, '{broken']) {
    const s = setup({ plugin: { catalog }, repo: { enrolled: true, frameworks: ['gdpr'] } });
    const r = runScript('prompt-router.mjs', { ...s, input: prompt('legg til et skjema for kunden') });
    assert.equal(r.status, 0);
    const c = context(r);
    assert.match(c, /compliance-guard/);
    assert.doesNotMatch(c, /Aktive kontroller/);
  }
});

test('prompt-router: the plugin name comes from plugin.json', () => {
  const s = setup({ plugin: { name: 'acme' }, repo: { enrolled: true } });
  const c = context(runScript('prompt-router.mjs', { ...s, input: prompt('legg til et skjema') }));
  assert.match(c, /^\[acme\]/);
  assert.match(c, /acme:compliance-guard/);
  assert.doesNotMatch(c, /forge:/);
});

test('prompt-router: new project suggests enroll once per session', () => {
  const s = setup();
  const first = runScript('prompt-router.mjs', { ...s, input: prompt('jeg vil starte et nytt prosjekt') });
  assert.match(context(first), /\/forge:enroll/);
  const second = runScript('prompt-router.mjs', { ...s, input: prompt('new project for bookings') });
  assert.equal(second.stdout, '');
  const otherSession = runScript('prompt-router.mjs', { ...s, input: prompt('new project', { session_id: 's2' }) });
  assert.match(context(otherSession), /\/forge:enroll/);
});

test('prompt-router: ordinary prompts in a non-enrolled repo stay silent', () => {
  const s = setup();
  assert.equal(runScript('prompt-router.mjs', { ...s, input: prompt('hvorfor feiler testen') }).stdout, '');
});

test('prompt-router: new project suggestion works when the state dir is missing', () => {
  const s = setup();
  s.dataDir = path.join(tmp(), 'does', 'not', 'exist');
  assert.match(context(runScript('prompt-router.mjs', { ...s, input: prompt('start et prosjekt') })), /enroll/);
});

// ---------- catalog-query ----------

test('catalog-query prints matching controls as JSON', () => {
  const s = setup();
  const r = runScript('catalog-query.mjs', { ...s, args: ['--tags', 'personal-data', '--frameworks', 'gdpr,iso27001'] });
  assert.equal(r.status, 0);
  assert.deepEqual(JSON.parse(r.stdout).map((c) => c.id), ['DP-01', 'DP-02', 'GEN-01']);
});

test('catalog-query with a missing catalog prints []', () => {
  const s = setup({ plugin: { catalog: null } });
  const r = runScript('catalog-query.mjs', { ...s, args: ['--tags', 'ui'] });
  assert.equal(r.status, 0);
  assert.deepEqual(JSON.parse(r.stdout), []);
});

// ---------- enroll ----------

test('enroll creates forge.json at the git root and is idempotent', () => {
  const s = setup();
  const sub = path.join(s.project, 'sub');
  fs.mkdirSync(sub);
  const r1 = runScript('enroll.mjs', { ...s, project: sub });
  assert.equal(r1.status, 0);
  const file = fs.realpathSync(s.project) === s.project ? path.join(s.project, 'forge.json') : null;
  const found = fs.existsSync(path.join(s.project, 'forge.json'));
  assert.ok(found || file, 'forge.json at git root');
  const data = JSON.parse(fs.readFileSync(path.join(s.project, 'forge.json'), 'utf8'));
  assert.match(data.enrolled, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(data.forgeVersion, '9.9.9');
  assert.deepEqual(data.frameworks, []);
  assert.ok(!fs.existsSync(path.join(sub, 'forge.json')));

  const before = fs.readFileSync(path.join(s.project, 'forge.json'), 'utf8');
  const r2 = runScript('enroll.mjs', { ...s });
  assert.equal(r2.status, 0);
  assert.match(r2.stdout, /allerede meldt inn/);
  assert.equal(fs.readFileSync(path.join(s.project, 'forge.json'), 'utf8'), before);
});

test('enroll refuses outside a git repo and writes nothing', () => {
  const s = setup({ repo: { git: false } });
  const r = runScript('enroll.mjs', { ...s, env: { GIT_CEILING_DIRECTORIES: path.dirname(s.project) } });
  assert.notEqual(r.status, 0);
  assert.match(r.stdout, /ikke et git-repo/);
  assert.ok(!fs.existsSync(path.join(s.project, 'forge.json')));
});

test('after enroll, the hooks become active', () => {
  const s = setup();
  assert.equal(runScript('session-start.mjs', { ...s, input: {} }).stdout, '');
  runScript('enroll.mjs', { ...s });
  assert.match(context(runScript('session-start.mjs', { ...s, input: {} })), /meldt inn/);
});

// ---------- timing ----------

test('p95 wall time under 300 ms over 20 runs of each hook', () => {
  const s = setup({ repo: { enrolled: true, frameworks: ['gdpr'], files: { 'package.json': '{}' } } });
  const cases = {
    'session-start.mjs': { ...s, input: { source: 'startup' } },
    'prompt-router.mjs': { ...s, input: prompt('legg til et skjema der kunden kan endre telefonnummeret sitt') },
  };
  const report = [];
  for (const [script, opts] of Object.entries(cases)) {
    runScript(script, opts); // oppvarming
    const times = Array.from({ length: 20 }, () => runScript(script, opts).ms);
    const v = p95(times);
    report.push(`${script}: p95 ${v.toFixed(0)} ms, median ${[...times].sort((a, b) => a - b)[10].toFixed(0)} ms, max ${Math.max(...times).toFixed(0)} ms`);
    assert.ok(v < 300, `${script} p95 ${v}`);
  }
  console.log(report.join('\n'));
});

// ---------- name ----------

test('no script hard-codes the plugin name (except reading plugin.json)', () => {
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith('.mjs')) files.push(p);
    }
  };
  walk(scriptsDir);
  assert.ok(files.length >= 6);
  // Tillatt: filnavnet forge.json (innmeldingsfilen), FORGE_*-miljøvariabelen og forgeVersion-feltet.
  const allowed = /forge\.json|FORGE_[A-Z_]+|forgeVersion/g;
  const offenders = [];
  for (const f of files) {
    fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (/forge/i.test(line.replace(allowed, ''))) offenders.push(`${path.relative(realPluginRoot, f)}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(offenders, []);
});
