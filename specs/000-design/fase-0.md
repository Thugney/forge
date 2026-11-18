# Fase 0 · resultat

**Dato:** 18. november 2026. **Miljø:** Windows 11, Claude Code 2.1.325, Node 24.12, Git for Windows 2.56. **Kilde:** ekte, lokale Claude Code-økter (`claude -p --plugin-dir plugins/forge --model haiku`) i et syntetisk testrepo. Prøvehookene i `plugins/forge/scripts/probe.mjs` logget hva Claude Code sendte, og svarte med kodeord eller avslag.

Kommandoen i hver prøve:

```sh
FORGE_PROBE=1 FORGE_PROBE_LOG_DIR=<temp> claude -p --plugin-dir plugins/forge \
  --model haiku --permission-mode bypassPermissions --output-format json "<prøve>"
```

## Det vi lurte på, og svaret

| # | Spørsmål | Svar | Bevis |
| --- | --- | --- | --- |
| 1 | Når `additionalContext` fra `SessionStart` økten? | **Ja** | Modellen siterte kodeordet KOBALT |
| 2 | Når `additionalContext` fra `UserPromptSubmit` økten? | **Ja** | Modellen siterte kodeordet SAFIR |
| 3 | Kan `PreToolUse` nekte Bash-verktøyet? | **Ja** | `PreToolUse:Bash hook error: FORGE_PROBE: kommandoen ble nektet av prøvehooken.` Kommandoen kjørte ikke |
| 4 | Kan `PreToolUse` nekte PowerShell-verktøyet? | **Ja** | Samme avslag for `PowerShell`. `git status` etterpå kjørte som normalt |
| 5 | Kan `PreToolUse` nekte Write? | **Ja** | `PreToolUse:Write hook error: … skriving ble nektet`. Filen ble ikke laget. Grunnlaget for `plan-guard` |
| 6 | Virker feltet `if` (`Bash(git *)`, `PowerShell(git *)`)? | **Ja** | Hooken med `if` fyrte for `git status`, ikke for `echo …`, i begge verktøy |
| 7 | Kan `Stop` blokkere og holde agenten i gang? | **Ja** | Agenten svarte etter blokken. Neste `Stop` kom med `stop_hook_active: true`, slik at løkkevernet kan bygge på det |
| 8 | Når en skråstrekkommando du skriver `UserPromptSubmit`? | **Ja** | Hooken fikk `prompt: "/forge:probe"` ordrett. Godkjenningsmerket i del 7.4 kan bygges som planlagt |
| 9 | Fyrer `PostToolUse` med matcher `Skill`? | **Ja** | Hooken fikk `tool_name: "Skill"` og `tool_input.skill: "forge:probe"`. `skill-seen` beholdes |
| 10 | Finnes `CLAUDE_PLUGIN_ROOT`, `CLAUDE_PLUGIN_DATA`, `CLAUDE_PROJECT_DIR` i hook-prosessen? | **Ja** | Alle tre satt i alle hendelser |
| 11 | Tidsbruk per hook (Node-oppstart pluss skript) | **26–155 ms**, typisk ca. 30 ms | `process.uptime()` i hver kjøring, 25 kjøringer. Godt under budsjettet på 300 ms |

## Andre funn

- Hook-avslag vises for modellen som `PreToolUse:<verktøy> hook error: <grunn>`. Modellen leste grunnen og prøvde ikke å gå rundt den i noen av prøvene. Det er likevel ikke en garanti: stoppvaktens blokk 3 er sikkerhetsnettet.
- Når en Stop-blokk og et svar kolliderer, vinner blokken: siste svar blir det blokken ba om. Grunnene våre må derfor si hva agenten skal gjøre, ikke bare hva som er galt.
- `claude plugin validate` består for både markedsplassen og pluginen.
- `npm test`: 6 av 6 består.

## Ikke prøvd i fase 0

- Installasjon gjennom markedsplassen (`claude plugin marketplace add` og `install`). Prøvene brukte `--plugin-dir`. Installasjonen prøves i fase 1.
- Interaktiv økt i terminalen. Prøvene var ikke-interaktive (`-p`). Hook-hendelsene er de samme, men det eieren ser på skjermen (`systemMessage`) er ikke kontrollert.
- macOS og Linux.

## Neste steg

Fase 1: fjern prøvehookene, og bygg `prompt-router`, `session-start` (oppdagelse og innmelding), `compliance-guard` og katalogen.
