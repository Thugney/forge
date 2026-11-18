# Changelog

## 3.0.0-preview.1 (phase 1)

- Removed the phase 0 probes.
- Hooks: `session-start` (silent until the project is enrolled; summary and baseline hint after) and `prompt-router` (keyword tags, active controls, skill and model routing). Both fail open and honour `FORGE_DISABLE=1`.
- `/forge:enroll` creates `forge.json` at the git root (idempotent, refuses outside git). `scripts/catalog-query.mjs` looks up controls for skills.
- Control catalog: 51 controls (48 core, 3 HIPAA-only) mapped to GDPR, ISO 27001:2022, SOC 2 and HIPAA. All mappings are marked draft until reviewed against the source texts.
- Skills: `compliance-guard` (modes gate, baseline, init, evidence) and `model-router`. Agents: architect (Fable), builder (Sonnet), explorer (Haiku).
- Zero-dependency libs in `scripts/lib` (io, project, classify, catalog); the plugin name is always read from `plugin.json`.

## 3.0.0-preview.0 (unreleased)

- New Claude Code plugin replacing project-init v2.
- Approved design: `specs/000-design/spec.md`.
- Phase 0: plugin shell, local marketplace, hook probes (inactive unless `FORGE_PROBE=1`).
