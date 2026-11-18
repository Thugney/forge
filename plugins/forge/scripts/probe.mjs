// Fase 0: prøvehook. Logger hva Claude Code sender, og svarer slik at vi kan se
// om svaret når økten. Gjør ingenting med mindre FORGE_PROBE=1.
// Feiler alltid åpent: et krasj gir kode 0 og ingen utdata.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const event = process.argv[2] || 'unknown';

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

function logDir() {
  const base = process.env.FORGE_PROBE_LOG_DIR
    || (process.env.CLAUDE_PLUGIN_DATA ? path.join(process.env.CLAUDE_PLUGIN_DATA, 'logs') : path.join(os.tmpdir(), 'forge-probe'));
  fs.mkdirSync(base, { recursive: true });
  return base;
}

function out(obj) { process.stdout.write(JSON.stringify(obj)); }

try {
  if (process.env.FORGE_PROBE !== '1') process.exit(0);

  const raw = readStdin();
  let input = {};
  try { input = JSON.parse(raw); } catch { input = { _parseError: true, _rawLength: raw.length }; }

  const ti = input.tool_input || {};
  const entry = {
    t: new Date().toISOString(),
    event,
    uptimeMs: Math.round(process.uptime() * 1000),
    hook_event_name: input.hook_event_name,
    session_id: input.session_id,
    source: input.source,
    prompt: typeof input.prompt === 'string' ? input.prompt.slice(0, 200) : undefined,
    tool_name: input.tool_name,
    command: typeof ti.command === 'string' ? ti.command.slice(0, 200) : undefined,
    file_path: ti.file_path,
    skill: ti.skill || ti.name || ti.command_name,
    tool_input_keys: Object.keys(ti),
    stop_hook_active: input.stop_hook_active,
    has_last_message: typeof input.last_assistant_message === 'string',
    env: {
      CLAUDE_PLUGIN_ROOT: Boolean(process.env.CLAUDE_PLUGIN_ROOT),
      CLAUDE_PLUGIN_DATA: Boolean(process.env.CLAUDE_PLUGIN_DATA),
      CLAUDE_PROJECT_DIR: Boolean(process.env.CLAUDE_PROJECT_DIR),
      SHELL: process.env.SHELL || null,
      platform: process.platform,
    },
  };
  const dir = logDir();
  fs.appendFileSync(path.join(dir, 'probe.jsonl'), JSON.stringify(entry) + '\n');

  if (event === 'SessionStart') {
    out({ hookSpecificOutput: { hookEventName: 'SessionStart',
      additionalContext: 'FORGE_PROBE: SessionStart-kontekst nådde økten. Kodeord: KOBALT.' } });
  } else if (event === 'UserPromptSubmit') {
    out({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit',
      additionalContext: 'FORGE_PROBE: UserPromptSubmit-kontekst nådde økten. Kodeord: SAFIR.' } });
  } else if (event === 'PreToolUse' && entry.command && entry.command.includes('forge-probe-deny')) {
    out({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny',
      permissionDecisionReason: 'FORGE_PROBE: kommandoen ble nektet av prøvehooken.' } });
  } else if (event === 'PreToolUse-write' && String(entry.file_path || '').includes('forge-probe-deny')) {
    out({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny',
      permissionDecisionReason: 'FORGE_PROBE: skriving ble nektet av prøvehooken.' } });
  } else if (event === 'Stop' && process.env.FORGE_PROBE_STOP === '1' && !input.stop_hook_active) {
    const marker = path.join(dir, `stop-${input.session_id || 'x'}.done`);
    if (!fs.existsSync(marker)) {
      fs.writeFileSync(marker, '1');
      out({ decision: 'block', reason: 'FORGE_PROBE: Stop-blokk. Svar bare med ordet SMARAGD.' });
    }
  }
  process.exit(0);
} catch {
  process.exit(0);
}
