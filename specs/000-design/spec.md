# forge · designdokument (spec 000)

**Status:** utkast til godkjenning. Ingenting er bygget. Ingenting bygges før eieren har godkjent.
**Dato:** 18. november 2026. **Skrevet av:** arkitekt-agenten (Claude, Fable 5.2).
**Navn:** `forge` (besluttet). Navnet står i `plugin.json` og i markedsplass-oppføringen, og ellers ingen steder i kode (se del 2.3).
**Hvor den bor:** i et nytt GitHub-repo, `Thugney/forge`. `Thugney/project-init` får merket `v2-final`, en henvisning i README og arkiveres (del 8.5). Dette dokumentet flyttes inn i det nye repoet når byggingen starter.

**Tre eierbeslutninger er lagt inn etter første utkast:** samme repo (del 8.5), fabrikkflyten med sju faser (del 7), og profesjonell bruk av GitHub i tre lag (del 6A). Dokumentet er derfor lengre enn planlagt.

## 0. Eierens beslutninger 18.11.2026

Disse gjelder foran alt annet i dokumentet. Der en senere del sier noe annet, gjelder denne listen.

1. **Navn og repo:** pluginen heter `forge` og får et eget repo, `Thugney/forge`. `project-init` arkiveres med en henvisning (del 8.5).
2. **Bare innmeldte prosjekter:** pluginen gjør ingenting i et prosjekt før eieren melder det inn med `/forge:enroll`. Innmeldingen lager `forge.json` i roten. Uten den filen er alle hooks stille. Det finnes ingen mas om baseline i andre mapper, og `/forge:skip` utgår (del 3.1, 4.2).
3. **GitHub gratisplan:** eieren har ikke Pro. Private repoer får derfor ikke regelsett eller grenbeskyttelse, og heller ikke push-vern mot hemmeligheter. Der bærer lag B (lokale vakter) og CI (gitleaks, avhengighetssjekk) lasten. Offentlige repoer får regelsett og push-vern gratis (del 6A.2).
4. **Ingen kode før planen er godkjent. Det blokkeres, det advares ikke.** En ny vakt (`plan-guard`, del 3.5) nekter endring av kildefiler i et innmeldt prosjekt til det aktive steget har godkjent omfang. Stoppvakten blokkerer det samme hvis endringen kom via skall (del 3.4). Vakten før utrulling er også med.
5. **Rammeverk etter v1:** velges per prosjekt i fasen Krav, ut fra hva vi bygger og hvilke data det gjelder. Det er ingen fast rekkefølge for Normen og UAE PDPL.

**Har du 15 minutter:** les del 1, del 7.1–7.5, tabellen i 6A.1, byggeplanen i del 9 og spørsmålene i del 10. Resten er oppslag.

---

## 1. Mål og ikke-mål

### Mål

1. **Krav bygget inn fra start.** Hvert prosjekt møter de tekniske kravene og prosesskravene i GDPR, ISO 27001 og SOC 2 (og HIPAA når prosjektet har amerikanske helseopplysninger), og tar vare på bevis en revisor kan lese.
2. **Automatisk, hver gang.** Du skal aldri måtte si «bruk skill X». Hooks leser meldingen din og forteller agenten hvilke skills og krav som gjelder.
3. **Nytt prosjekt:** oppsett fra første dag. **Eksisterende prosjekt:** gap-rapport før første endring.
4. **Fast modellruting** (Fable / Opus / Sonnet / Haiku) som global regel.
5. **Én pakke, installert én gang.** Ingen kopier av skills i hvert prosjekt.
6. **Fabrikkflyt i små steg.** Sju faser i klarspråk som gjentas for hvert lille steg: Plan → Krav → Design → Bygg → Sjekk → Rull ut → Tilbakemelding. Agenten leder deg gjennom. Du godkjenner to steder: omfanget og utrullingen.
7. **GitHub brukt som et ordentlig utviklingslag** i alle prosjekter: sak → gren → pull request → CI → gjennomgang → sammenslåing. Håndhevet på GitHub, lokalt og i flyten (del 6A).

### Ikke-mål

- Ikke sertifisering. Ikke juridisk rådgivning.
- Ikke full Codex-støtte i v1 (bare et kort AGENTS.md-utdrag og CI).
- Ikke flere agenter som bygger samtidig i egne arbeidstrær i v1. Det kommer i en senere fase (del 9, fase 7).
- Ikke eget spec-rammeverk, hash-kjeder eller pikselsammenligning av skjermbilder. Det var dette som gjorde project-init v2 tungt.
- Ikke automatisk utrulling. Aldri.
- Ikke nettverkskall eller språkmodellkall fra hooks.

### Ærlighetsregelen

Verktøyet og agenten sier **«bygget etter kravene»** og **«klart for revisjon»**. De sier aldri «sertifisert» eller «compliant» som en juridisk påstand. Regelen står i `compliance-guard`, og stoppvakten varsler hvis ordene dukker opp i nye brukertekster uten forbehold.

Hvert bevis merkes med kilde: `ci`, `local-run`, `code-read` eller `owner-attested`. Det er samme tanke som å skille simulator fra ekte.

### Hva en plugin kan og ikke kan garantere

| Kan garantere (kode som alltid kjører) | Kan ikke garantere |
| --- | --- |
| At rutingteksten blir lagt inn ved hver melding | At modellen følger den. Teksten er fortsatt et råd til modellen |
| At hemmeligheter og manglende RLS i endringene blir oppdaget og stoppet | At heuristikk finner alt. Den finner kjente mønstre |
| At manglende profil blir oppdaget ved oppstart | At organisatoriske krav er oppfylt. Det er din prosess |
| At CI kjører skannerne ved hver push | At noen ikke går utenom (`--no-verify`, slå av plugin). Det kan ikke hindres, bare synes |
| At et steg ikke flyttes til neste fase uten bevis og godkjenning, når flyttingen går gjennom tavlehjelperen | At agenten ikke redigerer tavlefilen direkte. Det oppdages og varsles, men kan ikke hindres |

Derfor er lagene: hook gir rask beskjed, CI er beviset revisor godtar, og du godkjenner.

---

## 2. Pakken

### 2.1 Hva jeg har kontrollert mot dokumentasjonen

Kontrollert 18.11.2026 mot `code.claude.com/docs/en/hooks`, `/plugins-reference`, `/plugins/components` og `/plugin-marketplaces`. Krav til maskinen: Windows 11, Git Bash og PowerShell, Node ≥ 20.

| Punkt | Kontrollert |
| --- | --- |
| Manifest | `.claude-plugin/plugin.json`. Bare `name` er påkrevd. Alt annet (`skills/`, `agents/`, `commands/`, `hooks/hooks.json`) ligger i roten av pluginen, ikke i `.claude-plugin/` |
| `hooks/hooks.json` | Samme form som `hooks` i `settings.json`, pakket i en ytre `"hooks"`-nøkkel. Plugin-hooks slås sammen med dine egne og kjører parallelt |
| Stivariabler | `${CLAUDE_PLUGIN_ROOT}` (installasjonsmappe, endres ved oppdatering, ikke skriv dit), `${CLAUDE_PLUGIN_DATA}` (`~/.claude/plugins/data/<id>/`, overlever oppdatering), `${CLAUDE_PROJECT_DIR}`. Erstattes i hook-kommandoer og i teksten i skills, kommandoer og agenter. Finnes også som miljøvariabler i hook-prosessen, men ikke i kommandoer agenten kjører selv |
| Exec-form | `"command": "node", "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/x.mjs"]` kjører uten skall. Dokumentasjonen anbefaler dette på Windows fordi `node.exe` er en ekte kjørbar fil. Ingen sitering nødvendig |
| `SessionStart` | Inndata: `source` (`startup`, `resume`, `clear`, `compact`, `fork`). Utdata: `hookSpecificOutput.additionalContext`, eller ren tekst på stdout. **Kan ikke blokkere** |
| `UserPromptSubmit` | Inndata: `prompt`. Utdata: `hookSpecificOutput.additionalContext`. Ingen matcher. Standard tidsgrense 30 s. Ved tidsavbrudd går meldingen videre uten teksten |
| `Stop` | Inndata: `stop_hook_active`, `last_assistant_message`. Utdata: `{"decision":"block","reason":"…"}` holder agenten i gang. `systemMessage` viser en advarsel til deg. Innebygd tak: 8 fortsettelser på rad |
| `PostToolUse` | Matcher på verktøynavn. Kan ikke blokkere (verktøyet har alt kjørt) |
| Avslutningskoder | 0 = ok, JSON på stdout brukes. 2 = blokker (stderr er grunnen). Andre koder = feil som ikke blokkerer |
| `additionalContext` | Tak på 10 000 tegn per felt. Over det skrives teksten til fil og agenten får bare en forhåndsvisning |
| Felles inndata | `session_id`, `transcript_path`, `cwd`, `permission_mode`, `hook_event_name` |
| Plugin-agenter | Får navn `<plugin>:<navn>`. `model` støttes. `hooks`, `mcpServers` og `permissionMode` ignoreres |
| Plugin-skills | Får navn `<plugin>:<mappe>`. Modellen kan laste dem selv ut fra beskrivelsen |
| Kommandoer | Støttes, men dokumentasjonen kaller dem det eldre formatet og anbefaler skills. Vi bruker tynne kommandofiler som bare starter en skill i riktig modus |
| Lokal markedsplass | `.claude-plugin/marketplace.json` med `name`, `owner`, `plugins[]`. Med lokal mappe og relativ `source` leser Claude Code filene direkte. Endringer gjelder fra neste økt eller `/reload-plugins` |
| `userConfig` | Verdier leses i hooks som `CLAUDE_PLUGIN_OPTION_<NØKKEL>` |

| `PreToolUse` | Kan nekte et verktøykall med `hookSpecificOutput.permissionDecision: "deny"`. Feltet `if` (for eksempel `"Bash(git commit *)"`) filtrerer før skriptet starter. Brukes bare i del 3.5 |

**Kontrollert i fase 0 (18.11.2026, ekte økter på Windows):** `PostToolUse` med matcher `Skill` fyrer, en skråstrekkommando du skriver når `UserPromptSubmit` ordrett, `PreToolUse` kan nekte Bash, PowerShell og Write, feltet `if` virker, og en hook bruker 26–155 ms. Se [fase-0.md](fase-0.md).

### 2.2 Filtre

```text
forge/  (GitHub: Thugney/forge)  # repoet er også markedsplassen
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── forge/
│       ├── .claude-plugin/plugin.json
│       ├── hooks/hooks.json
│       ├── scripts/
│       │   ├── session-start.mjs        # SessionStart
│       │   ├── prompt-router.mjs        # UserPromptSubmit
│       │   ├── skill-seen.mjs           # PostToolUse (Skill)
│       │   ├── stop-guard.mjs           # Stop
│       │   ├── catalog-query.mjs        # kjøres av skills: «hvilke kontroller gjelder?»
│       │   ├── board.mjs                # tavlehjelper: eneste som skriver tavla (del 7)
│       │   ├── git-guard.mjs            # PreToolUse: nekter farlige git- og gh-kommandoer (del 6A.3)
│       │   ├── github-setup.mjs         # forhåndsvisning og oppsett av GitHub-innstillinger (del 6A.2)
│       │   ├── checks/
│       │   │   ├── secrets.mjs          # BLOKK
│       │   │   ├── rls.mjs              # BLOKK
│       │   │   ├── pii-logs.mjs         # ADVARSEL
│       │   │   ├── evidence.mjs         # ADVARSEL
│       │   │   └── claims.mjs           # ADVARSEL («sertifisert», «compliant»)
│       │   └── lib/
│       │       ├── io.mjs               # les stdin, trygg avslutning, logg
│       │       ├── git.mjs              # endrede filer og tillagte linjer
│       │       ├── profile.mjs          # les compliance/profile.json
│       │       ├── state.mjs            # øktminne i ${CLAUDE_PLUGIN_DATA}
│       │       ├── classify.mjs         # nøkkelord → kategorier
│       │       └── keywords.json        # norsk og engelsk ordliste
│       ├── catalog/
│       │   ├── controls.json            # alle kontroller (del 5)
│       │   └── frameworks.json          # rammeverk: id, navn, standard på/av, versjon
│       ├── skills/
│       │   ├── compliance-guard/
│       │   │   ├── SKILL.md             # kort: ærlighetsregel + valg av modus
│       │   │   ├── modes/init.md  baseline.md  gate.md  evidence.md
│       │   │   └── reference/gdpr.md  soc2.md  iso27001.md  hipaa.md  ai.md
│       │   ├── project-start/SKILL.md
│       │   ├── flow/                    # fabrikkflyten
│       │   │   ├── SKILL.md             # kort: de sju fasene, portene, «les tavla først»
│       │   │   └── phases/plan.md  requirements.md  design.md  build.md
│       │   │              verify.md  rollout.md  feedback.md
│       │   ├── github-flow/SKILL.md     # sak → gren → PR → CI → sammenslåing (del 6A.4)
│       │   └── model-router/SKILL.md    # flyttet fra ~/.claude/skills
│       ├── agents/
│       │   ├── architect.md             # model: fable
│       │   ├── builder.md               # model: sonnet
│       │   ├── explorer.md              # model: haiku
│       │   └── reviewer.md              # model: opus, bare lesetilgang (uavhengig gjennomgang)
│       ├── commands/
│       │   ├── plan.md  next.md  status.md  approve.md  feedback.md
│       │   └── baseline.md  enroll.md  hotfix.md  github-setup.md
│       └── templates/
│           ├── profile.json  data-map.json  risks.json  controls.json  exceptions.json
│           ├── PLAN.md  step.md  rollout.md  feedback.md
│           ├── evidence.md  AGENTS-snippet.md
│           └── github/                  # README, SECURITY, CONTRIBUTING, CODEOWNERS, CODE_OF_CONDUCT,
│                                        # .gitattributes, dependabot.yml, saks- og PR-maler,
│                                        # workflows/ci.yml og workflows/security.yml
├── tests/                               # node --test, se del 9
├── specs/000-design/spec.md             # dette dokumentet
├── package.json                         # bare "test": "node --test tests/"
├── CHANGELOG.md  NOTICE.md  SECURITY.md # beholdes fra v2, oppdateres
├── README.md                            # skrives på nytt
└── LICENSE                              # Apache-2.0, uendret
```

Installasjon, én gang, fra den lokale klonen av repoet:

```sh
claude plugin validate <sti til klonen>
claude plugin marketplace add <sti til klonen>
claude plugin install forge@local-tools
```

Med lokal sti leser Claude Code filene direkte, så endringer virker fra neste økt. Senere kan markedsplassen legges til fra GitHub (`Thugney/forge`). Markedsplassen heter `thugney`, så installasjonen er `claude plugin install forge@thugney`. Da styrer `version` i `plugin.json` når du får en oppdatering.

### 2.3 Manifest og navn

```json
{
  "name": "forge",
  "version": "3.0.0-preview.1",
  "description": "Krav til sikkerhet og personvern bygget inn i alt arbeid: ruting, oppstartssjekk, stoppvakt og bevis.",
  "author": { "name": "Eier" },
  "license": "Apache-2.0",
  "userConfig": {
    "strictness": {
      "type": "string", "title": "Strenghet",
      "description": "block: stopp på hemmeligheter og manglende RLS. warn: bare advarsler. off: ingen sjekk.",
      "options": ["block", "warn", "off"], "default": "block"
    },
    "language": {
      "type": "string", "title": "Språk i meldinger",
      "description": "Språket hooks skriver på.",
      "options": ["nb", "en"], "default": "nb"
    }
  }
}
```

Versjonen fortsetter etter v2-linjen, slik at historikken i repoet henger sammen.

**Navnet står tre steder:** `name` i `plugin.json`, oppføringen i `marketplace.json`, og mappenavnet `plugins/forge`. Skriptene leser navnet fra `plugin.json` når de trenger det (for eksempel for å skrive `forge:compliance-guard` i rutingteksten). En test feiler hvis navnet står hardkodet i et skript eller en skill.

### 2.4 `hooks/hooks.json`

```json
{
  "description": "Ruting, oppstartssjekk og stoppvakt",
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "node",
          "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/session-start.mjs"], "timeout": 5 } ] }
    ],
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "node",
          "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/prompt-router.mjs"], "timeout": 5 } ] }
    ],
    "PreToolUse": [
      { "matcher": "Bash|PowerShell",
        "hooks": [
          { "type": "command", "if": "Bash(git *)", "command": "node",
            "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/git-guard.mjs"], "timeout": 5 },
          { "type": "command", "if": "Bash(gh *)", "command": "node",
            "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/git-guard.mjs"], "timeout": 5 },
          { "type": "command", "if": "PowerShell(git *)", "command": "node",
            "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/git-guard.mjs"], "timeout": 5 },
          { "type": "command", "if": "PowerShell(gh *)", "command": "node",
            "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/git-guard.mjs"], "timeout": 5 }
        ] }
    ],
    "PostToolUse": [
      { "matcher": "Skill",
        "hooks": [ { "type": "command", "command": "node",
          "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/skill-seen.mjs"], "timeout": 5 } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "node",
          "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/stop-guard.mjs"], "timeout": 15,
          "statusMessage": "Kontrollerer hemmeligheter og tilgangsregler" } ] }
    ]
  }
}
```

---

## 3. Hooks

### Felles regler

- **Null avhengigheter.** Bare Node sine innebygde moduler. Ingen `npm install`.
- **Aldri lås en økt.** Hvert skript har én ytre `try/catch`. Ved uventet feil: avslutt med kode 0, skriv `systemMessage` («forge: stoppvakten feilet, fortsetter uten sjekk») og logg til `${CLAUDE_PLUGIN_DATA}/logs/forge.log`.
- **Blokkering skjer bare ved et faktisk funn.** Krasjer selve sjekken, slipper vi gjennom med en tydelig advarsel. Et krasj er ikke et funn. CI er sikkerhetsnettet.
- **Nødbrems.** `strictness: off` i innstillingene, eller miljøvariabelen `FORGE_DISABLE=1`.
- **Windows.** Exec-form med `node` virker likt i Git Bash og PowerShell. Skriptene bruker `node:path` og tåler både `\` og `/`. Git kalles med `spawnSync('git', [...])` uten skall.
- **Ikke et git-repo, eller prosjektet er ikke meldt inn** (ingen `forge.json` i roten): alle hooks er stille. Det eneste unntaket er at `prompt-router` foreslår `/forge:enroll` når meldingen tydelig starter et nytt prosjekt. Det skjer høyst én gang per økt.
- **Aldri vis en hemmelig verdi.** Funn oppgir fil, linje og regel, aldri innholdet.

### 3.1 `session-start.mjs` (SessionStart)

| | |
| --- | --- |
| Utløser | Hver start, gjenopptakelse, `/clear` og komprimering |
| Logikk | 1) Finn prosjektroten (`CLAUDE_PROJECT_DIR`). 2) Lagre nåværende `HEAD` i øktminnet, slik at stoppvakten vet hva som er nytt i økten. 3) Les `compliance/profile.json` og `project/board.json`. 4) Sjekk at de globale UI-skillene finnes (`~/.claude/skills/impeccable`, `ui-ux-pro-max`) |
| Utdata | **Tavle finnes:** aktivt steg, fase, hva som venter og på hvem. Eksempel: «Steg S-003 "Kunden kan endre telefonnummer" er i fase Sjekk. Mangler: uavhengig gjennomgang. Neste: `/forge:next`.» Slik fortsetter en ny økt i riktig fase. **Profil finnes:** 4–6 linjer: rammeverk som er på, om RLS gjelder, antall åpne gap, dato for siste gjennomgang. **Innmeldt, men uten profil, repo med kode:** «Kjør baseline før du endrer noe. Bruk skill `project-start`.» **Innmeldt, men uten profil, tomt repo:** «Start i fase Plan, så init i fase Krav.» **Ikke innmeldt** (ingen `forge.json`): ingen utdata. Ved `compact`: samme sammendrag på nytt, fordi konteksten er borte |
| Budsjett | Under 150 ms. Bare filsjekker og ett git-kall |
| Feil | Stille, kode 0. `SessionStart` kan uansett ikke blokkere |

«Tomt repo» betyr: ingen `package.json`, `pyproject.toml`, `go.mod`, `*.csproj`, `src/` eller migrasjonsmappe.

### 3.2 `prompt-router.mjs` (UserPromptSubmit)

| | |
| --- | --- |
| Utløser | Hver melding du sender |
| Logikk | Ordliste-treff på norsk og engelsk (små bokstaver, ordstammer). Gir ett eller flere merker: `ui`, `feature`, `personal-data`, `db-schema`, `api`, `auth`, `logging`, `third-party`, `ai`, `deps`, `infra`. Slår opp merkene i katalogen og finner kontrollene som er på for dette prosjektet |
| Utdata | `additionalContext`, maks ca. 1 200 tegn (taket er 10 000). Se eksempel under |
| Hopper over | Skråstrekkommandoer, og korte svar uten treff («ja», «fortsett»). Da kommer bare modellrutingslinjen |
| Budsjett | Under 120 ms. Ingen git-kall. Leser tre små JSON-filer |
| Feil | Kode 0 uten utdata. Meldingen går alltid videre |

Eksempel. Du skriver: *«legg til et skjema der kunden kan endre telefonnummeret sitt»*

```text
[forge] Treff: ui, feature, personal-data.
Tavle: ingen aktive steg. Dette er nytt arbeid → start i fase Plan (skill `forge:flow`).
1. UI: last skills `ui-ux-pro-max` og `impeccable` før du skriver UI-kode.
2. Krav: last skill `forge:compliance-guard` i modus gate FØR du skriver spec eller kode.
   Aktive kontroller: DP-01, DP-04, DP-06, PR-05, AC-02, AC-04, LG-01, CM-03.
3. Modell: følg `forge:model-router`. Avgrenset skjema → builder (Sonnet). Si fra én gang hvis
   økten står på feil modell.
4. Spec først: ingen kode før eieren har godkjent omfanget.
Åpne advarsler fra forrige tur: DP-06 mulig telefonnummer i logg, src/sms/send.ts:88.
```

Ordlisten (utdrag): `ui` = side, skjema, knapp, layout, design, komponent, mobil, portal, form, button, page. `personal-data` = navn, telefon, e-post, adresse, fødsel, personnummer, kunde, pasient, bruker, email, phone, patient. `db-schema` = tabell, kolonne, migrasjon, skjema, table, migration. `auth` = innlogging, passord, token, rolle, tilgang, login, session. `third-party` = leverandør, SDK, integrasjon, webhook, analytics, vendor. `ai` = modell, prompt, LLM, agent, transkripsjon, embedding.

**Ærlig begrensning:** ordlister bommer. Derfor er det billigere å melde for mye enn for lite, og stoppvakten kontrollerer resultatet uansett hva ruteren gjettet.

### 3.3 `skill-seen.mjs` (PostToolUse, matcher `Skill`)

Skriver navnet på skillen som ble lastet, i øktminnet. Under 80 ms. Brukes bare av stoppvakten til å si: «UI-filer er endret, men `impeccable` ble ikke lastet i denne økten.» Hvis fase 0 viser at matcheren ikke fyrer, utgår denne hooken, og advarselen bygger på filendringer alene.

### 3.4 `stop-guard.mjs` (Stop)

| | |
| --- | --- |
| Utløser | Hver gang agenten er ferdig med en tur |
| Hurtigvei | `git status --porcelain` sammenlignes med forrige kontrollerte tilstand. Ingen endring: avslutt på ca. 100 ms |
| Omfang | Bare **tillagte linjer** siden økten startet (`git diff <start-HEAD>`), pluss nye filer som ikke er ignorert. Hopper over binærfiler, låsefiler og filer over 256 kB |
| Budsjett | Under 300 ms i vanlig tilfelle. Tidsgrense 15 s. Går den over 2 s, kontrollerer den bare hemmeligheter og sier fra |

**BLOKK 1 · hemmeligheter (kontroll SDL-02).** Mønstre for kjente nøkkelformater (AWS, GitHub, Stripe, Slack, Twilio, Anthropic, OpenAI), private nøkkelblokker, tilkoblingsstrenger med passord, og generisk `secret|token|password|api_key = "<lang verdi med høy entropi>"`. I tillegg: en `.env`-fil som ikke er ignorert av git.

**BLOKK 2 · ny tabell uten radbasert tilgangskontroll (kontroll AC-03).** Bare når profilen sier `datastore.rls.required: true`. For hver endret fil som treffer `migrationGlobs`: finn `CREATE TABLE <navn>`. Samme fil må ha `ALTER TABLE <navn> ENABLE ROW LEVEL SECURITY` og minst én `CREATE POLICY … ON <navn>`. Tabeller i `exemptTables` hoppes over. Bare Postgres i v1.

Utdata ved blokk:

```json
{ "decision": "block",
  "reason": "forge AC-03: db/migrations/134_note.sql lager tabellen customer_note uten radbasert tilgangskontroll. Slå på RLS og lag en regel i samme migrasjon. Falsk alarm? Legg et unntak med begrunnelse i compliance/exceptions.json." }
```

**BLOKK 3 · kode uten godkjent omfang (kontroll SDL-01, CM-01).** Kildekode er endret mens det aktive steget mangler godkjent omfang, eller det ikke finnes noe aktivt steg. Dette fanger endringer som gikk utenom `plan-guard`, for eksempel via skall. Filer under `allowWithoutScope` (del 3.5) teller ikke.

**ADVARSEL (stopper ikke):**

| Sjekk | Kontroll | Hva den ser etter |
| --- | --- | --- |
| Personopplysninger i logg | DP-06 | Tillagt linje med loggkall (`console.*`, `logger.*`, `log.*`) som nevner et felt fra datakartet (`phone`, `email`, `name`, …) |
| Manglende bevis | CM-03 | Kildekode er endret, men ingen fil i `compliance/evidence/` er ny eller endret |
| Datakart ikke oppdatert | DP-01 | Migrasjon med ny kolonne som ligner personopplysning, uten endring i datakartet |
| Ny avhengighet | SDL-04, VN-04 | Manifest eller låsefil er endret |
| UI uten UI-skills | – | UI-filer endret, `impeccable` ikke lastet |
| «Ferdig» uten bevis | CM-03 | Siste svar sier «ferdig», «klart til test» eller «done», men steget har ikke bestått Sjekk |
| Tavla endret utenom hjelperen | CM-01 | `project/board.json` er endret, men hjelperens logg har ingen tilsvarende hendelse |
| Påstand | Ærlighetsregelen | «sertifisert», «GDPR-compliant», «HIPAA compliant» i nye brukertekster |

Advarsler vises til deg som `systemMessage` og lagres i øktminnet. Agenten får dem i neste melding gjennom ruteren. Slik tvinger de ikke frem en ny tur.

**Vern mot løkker.** Claude Code har et tak på 8 fortsettelser. Vi er strengere: samme funn (fil + regel) blokkerer høyst to ganger per økt. Deretter blir det en advarsel til deg merket «IKKE LØST».

**Unntak.** `compliance/exceptions.json` med fil, regel, begrunnelse, dato og hvem. Unntak ligger i git og er selv revisjonsbevis.

**Flere økter i samme mappe.** Diffen kan inneholde endringer fra en annen økt. Meldingen sier derfor: «Er ikke dette din endring, si fra til eieren i stedet for å rette den.»

### 3.5 Vakter før verktøykall (PreToolUse)

`PreToolUse`-hooks med feltet `if` koster ingenting ellers, fordi `if` filtrerer før skriptet starter.

1. **`git-guard`.** Nekter push til `main`, tvangspush, `--no-verify`, `git commit -a` og commit med hemmeligheter. Stoppvakten kjører etter at agenten er ferdig, og da kan en hemmelighet alt være committet. Denne stopper den før. Hele tabellen står i del 6A.3.
2. **`plan-guard` (besluttet, beslutning 4).** Matcher `Edit|Write|NotebookEdit` i innmeldte prosjekter. Nekter endring av kildefiler når det aktive steget ikke har godkjent omfang (port 1), eller når det ikke finnes noe aktivt steg. Disse er alltid tillatt, slik at planen kan skrives: `specs/**`, `docs/**`, `compliance/**`, `project/**`, `forge.json`, `*.md` i roten og `.github/ISSUE_TEMPLATE/**`. Listen kan utvides i profilen (`allowWithoutScope`). Avslaget sier på vanlig norsk hva som mangler og at neste steg er `/forge:approve`. **Hastefiks:** eieren skriver `/forge:hotfix <grunn>`. Det gir ett engangsmerke for ett lite steg. Grunnen logges, og steget må fortsatt gjennom Sjekk. Et skall-kall som skriver filer stoppes ikke her. Det fanges av stoppvaktens blokk 3.
3. **Vakt før utrulling** (besluttet). Profilen lister kommandoene som ruller ut i dette prosjektet (`rollout.commands`, for eksempel `vercel deploy --prod*` eller `docker compose -f docker-compose.prod.yml *`). De nektes til du har godkjent utrulling for det aktive steget. Dette gjør «aldri automatisk utrulling» til kode, ikke bare en regel i en tekst. Den bruker samme skript og samme godkjenningsmerke som `gh pr merge`-regelen.

---

## 4. Skills, agenter og kommandoer

Prinsipp: `SKILL.md` er kort (under 80 linjer). Tungt stoff ligger i underfiler og leses bare når modusen trenger det. Katalogen leses aldri hel. Skillen kjører `node ${CLAUDE_PLUGIN_ROOT}/scripts/catalog-query.mjs --triggers … --profile compliance/profile.json` og får bare kontrollene som gjelder.

### 4.1 `compliance-guard`

Fire moduser. `SKILL.md` inneholder ærlighetsregelen, kildemerkingen og valg av modus.

| Modus | Når | Gjør | Lager |
| --- | --- | --- | --- |
| `init` | Tomt repo | Spør om 6 ting (del 6.1). Lager profil og tomme maler. Foreslår CI-filen | `compliance/`-mappen |
| `baseline` | Eksisterende repo uten profil | Leser koden mot hver kontroll. **Peker på dokumenter som alt finnes, lager ikke kopier.** Skriver gap-rapport. Endrer ikke kildekode | `profile.json`, `controls.json`, `GAP-REPORT.md` |
| `gate` | Før spec for en funksjon | Henter aktive kontroller. Skriver 5–10 linjer «Krav fra kontrollene» som skal inn i spec eller oppgave. Sier fra hvis noe krever DPIA, ny leverandør eller ny datatype | Avsnitt i din spec |
| `evidence` | Etter bygging | Fyller bevisfilen med kommando og faktisk resultat. Oppdaterer status, datakart og leverandørliste hvis de er berørt | `compliance/evidence/<dato>-<navn>.md` |

`reference/*.md` forklarer hvert rammeverk i klarspråk og leses bare når agenten må vurdere et konkret krav.

### 4.2 `project-start`

Én side. Avgjør hvilken flyt som gjelder og i hvilken rekkefølge:

- **Tomt repo:** fase Plan (skill `flow`) → fase Krav med `compliance-guard init` → foreslå repo-filer, AGENTS.md-utdrag og GitHub-oppsett → vent på godkjenning.
- **Eksisterende repo:** `explorer` (Haiku) kartlegger filene → `compliance-guard baseline` (Opus) vurderer → gap-rapport til deg → du velger hvilke gap som blir steg på tavla. Ingen implementering før du har lest rapporten.
- **Innmelding:** `/forge:enroll` lager `forge.json` i roten (dato, eier, rammeverk som foreløpig er tomme). Prosjekter som ikke er meldt inn, berøres ikke. Engangsskript og notater meldes rett og slett ikke inn.

### 4.3 UI-skills

Vi **kopierer ikke** `impeccable`, `ui-ux-pro-max` eller `design-taste-frontend`. De blir der de er, i `~/.claude/skills`. Ruteren nevner dem ved navn når meldingen handler om UI. Oppstartssjekken sier fra hvis de mangler. Prosjektets egne regler (designsystem, språkressurser) vinner fortsatt over skill-standarder.

### 4.4 `model-router` og de tre agentene

- `model-router/SKILL.md` flyttes uendret inn i pluginen og heter da `forge:model-router`.
- `architect`, `builder` og `explorer` flyttes inn som de er. **Konsekvens:** de heter da `forge:architect`, `forge:builder` og `forge:explorer`. Ruteren skriver de fulle navnene, så agenten treffer riktig.
- Kopiene i `~/.claude/skills/model-router` og `~/.claude/agents/` slettes først i fase 6, når pluginen er bekreftet. Ellers får du to av hver.
- Ny agent: `reviewer` (Opus, bare `Read`, `Grep`, `Glob`, `Bash`). Den gjør den uavhengige gjennomgangen i fase Sjekk, med ny kontekst, og skriver `review.md`. Tre sjekklister: kode, sikkerhet og (når steget har skjerm) UI.
- Ruteren legger alltid inn én linje om modellvalg. Ved sterke treff legger den til et hint: «arkitektur, migrering, redesign» → `architect`. «Søk, finn, les gjennom» → `explorer`.

### 4.5 `flow` og `github-flow`

- `flow` driver de sju fasene. `SKILL.md` sier bare: les tavla, finn fasen, les fasefilen. Hver fasefil (`phases/*.md`) er skrevet for en eier som ikke er utvikler: hva agenten skal spørre om, i hvilke ord, og hva som skal ligge ferdig før fasen er over. Se del 7.
- `github-flow` er kunnskap og maler for arbeid mot GitHub. Se del 6A.4.

### 4.6 Kommandoer

Tynne filer på 3–5 linjer som starter en skill: `/forge:plan`, `/forge:next`, `/forge:status`, `/forge:approve`, `/forge:feedback`, `/forge:baseline`, `/forge:enroll`, `/forge:hotfix`, `/forge:github-setup`. Tabellen står i del 7.5. Vanlig bruk trenger dem sjelden, bortsett fra `approve`.

---

## 5. Kontrollkatalogen

### 5.1 Format (`catalog/controls.json`)

```json
{
  "catalogVersion": "0.1.0",
  "mappingStatus": "draft",
  "controls": [
    {
      "id": "AC-03",
      "title": "Kundeskille i datalaget: hver ny tabell får radbasert tilgangskontroll",
      "kind": "technical",
      "requirement": "…klarspråk…",
      "map": { "soc2": ["CC6.1", "C1.1"], "iso27001": ["A.8.3"], "gdpr": ["25", "32"], "hipaa": ["164.312(a)(1)"] },
      "triggers": ["db-schema"],
      "appliesWhen": { "profile": "datastore.rls.required" },
      "checks": [ { "type": "hook", "id": "rls", "severity": "block" }, { "type": "ci", "id": "rls-test" } ],
      "evidence": ["…"],
      "askInSpec": ["…"]
    }
  ]
}
```

| Felt | Verdier |
| --- | --- |
| `kind` | `technical` (i kode eller rørledning) eller `organisational` (policy, avtale, eierens prosess) |
| `triggers` | `ui`, `feature`, `personal-data`, `db-schema`, `api`, `auth`, `logging`, `third-party`, `ai`, `deps`, `infra`, `always`, `periodic` |
| `checks[].type` | `hook` (stoppvakten), `ci` (CI-malen), `agent` (agenten vurderer i gate og baseline), `owner` (du gjør det, agenten minner på) |
| `appliesWhen` | Valgfri betingelse mot profilen, eller `{"framework": "hipaa"}` |
| `map` | Nøkkel per rammeverk. Et nytt rammeverk er en ny nøkkel og en oppføring i `frameworks.json` |

**Viktig forbehold:** koblingene til paragrafer og punkter er skrevet etter beste kunnskap og er merket `draft`. De må leses mot kildetekstene før de kalles ferdige (fase 1, Opus-gjennomgang). ISO-teksten er betalt, så den kontrollen må du eller en revisor gjøre.

### 5.2 Alle kontroller (48 + 3 for HIPAA)

**T** = teknisk, **O** = organisatorisk. Sjekk: **H** = hook, **CI**, **A** = agentvurdering, **E** = eier. Fet **H** betyr blokkering.

| ID | Tittel | Type | Sjekk | SOC 2 | ISO 27001:2022 | GDPR art. | HIPAA 164. |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Sikker utvikling** | | | | | | | |
| SDL-01 | Krav til sikkerhet og personvern står i spec før bygging | T | A | CC8.1 | A.5.8, A.8.25, A.8.26 | 25 | 308(a)(1)(ii)(B) |
| SDL-02 | Ingen hemmeligheter i kode eller git | T | **H**, CI | CC6.1 | A.5.17, A.8.28 | 32 | 308(a)(5)(ii)(D) |
| SDL-03 | Inndata valideres, og feilmeldinger lekker ikke detaljer | T | A | CC6.6, PI1.2 | A.8.26, A.8.28 | 32 | 312(c)(1) |
| SDL-04 | Forsyningskjede: avhengigheter skannet og låst, SBOM, låste byggesteg | T | CI, H | CC7.1, CC9.2 | A.5.21, A.8.8 | 32 | 308(a)(5)(ii)(B) |
| SDL-05 | Sikkerhetstesting: SAST i CI og tester for tilgang og kundeskille | T | CI, A | CC7.1, CC8.1 | A.8.28, A.8.29 | 32(1)(d) | 308(a)(8) |
| SDL-06 | Skilte miljøer, og bare syntetiske data i test og demo | T | A | CC8.1 | A.8.31, A.8.33 | 5(1)(c), 25 | 502(b) |
| **Tilgangskontroll** | | | | | | | |
| AC-01 | Innlogging hos en kontrollert identitetstjeneste, token kontrolleres fullt | T | A | CC6.1, CC6.2 | A.5.16, A.8.5 | 32 | 312(d), 312(a)(2)(i) |
| AC-02 | Tilgang avgjøres på serveren, etter minste privilegium | T | A | CC6.1, CC6.3 | A.5.15, A.8.3 | 25(2), 32 | 312(a)(1), 308(a)(4) |
| AC-03 | Kundeskille i datalaget: hver ny tabell får radbasert tilgangskontroll | T | **H**, CI | CC6.1, C1.1 | A.8.3 | 25, 32 | 312(a)(1) |
| AC-04 | Serveren velger kunde og eier, aldri et felt fra klienten | T | A | CC6.1 | A.8.3, A.8.26 | 32 | 312(a)(1) |
| AC-05 | Privilegert tilgang og støttetilgang er begrenset, tidsavgrenset og logget | T | A, E | CC6.2, CC6.3 | A.8.2, A.5.18 | 32 | 308(a)(3), 308(a)(4) |
| AC-06 | Nøkler, økter og tokens har utløp og rotasjon, og lagres som hash | T | A | CC6.1 | A.5.17, A.8.5, A.8.24 | 32 | 312(a)(2)(iii), 312(d) |
| **Databeskyttelse** | | | | | | | |
| DP-01 | Datakart og protokoll over behandlinger er oppdatert | O | A, H | C1.1 | A.5.9, A.5.12, A.5.34 | 30 | 308(a)(1)(ii)(A) |
| DP-02 | Kryptering under transport | T | A | CC6.7 | A.5.14, A.8.24 | 32(1)(a) | 312(e)(1) |
| DP-03 | Kryptering ved lagring, og styring av nøkler | T | A, E | CC6.1, CC6.7 | A.8.24 | 32(1)(a) | 312(a)(2)(iv) |
| DP-04 | Dataminimering og personvern som standard | T | A | P3.1 | A.5.34, A.8.11 | 5(1)(c), 25 | 502(b) |
| DP-05 | Lagringstid og automatisk sletting for hver datatype | T | A, H | C1.2, P4.2, P4.3 | A.8.10, A.5.33 | 5(1)(e), 17 | 310(d)(2)(i) |
| DP-06 | Ingen personopplysninger eller hemmeligheter i logger, feilmeldinger og analyse | T | H, A | C1.1 | A.8.11, A.8.12, A.8.15 | 5(1)(c), 5(1)(f), 32 | 502(b) |
| BK-01 | Sikkerhetskopi er kryptert, gjenoppretting er testet, og mål er satt | T | A, E | A1.2, A1.3, CC7.5 | A.8.13, A.5.30 | 32(1)(c)–(d) | 308(a)(7) |
| **Personvernrettigheter** | | | | | | | |
| PR-01 | Formål og behandlingsgrunnlag for hver behandling | O | A, E | P3.1, P4.1 | A.5.31, A.5.34 | 5, 6, 9 | – |
| PR-02 | Personvernerklæringen stemmer med det koden gjør | O | A | P1.1 | A.5.34 | 12–14 | 520 |
| PR-03 | Samtykke: innhenting, bevis og tilbaketrekking | T | A | P2.1 | A.5.34 | 7 | 508 |
| PR-04 | Innsyn og dataportabilitet kan oppfylles | T | A | P5.1 | A.5.34 | 15, 20 | 524 |
| PR-05 | Retting, sletting, begrensning og innsigelse kan oppfylles | T | A | P5.2, P4.3 | A.5.34, A.8.10 | 16–19, 21 | 526 |
| PR-06 | Vurdering av personvernkonsekvenser (DPIA) ved høy risiko | O | A, E | CC3.2 | A.5.34 | 35, 36 | 308(a)(1)(ii)(A) |
| **Leverandører** | | | | | | | |
| VN-01 | Register over leverandører og underdatabehandlere | O | A, E | CC9.2, P6.4 | A.5.19, A.5.21 | 28, 30 | 308(b)(1) |
| VN-02 | Databehandleravtale før data deles | O | E | CC9.2, P6.4 | A.5.20 | 28(3) | 308(b)(1), 314(a) |
| VN-03 | Overføring ut av EØS har grunnlag og vurdering | O | A, E | CC9.2 | A.5.14, A.5.31 | 44–49 | – |
| VN-04 | Ny tredjepart (SDK, skript, API) vurderes før den tas i bruk | O | A, H | CC9.2, CC3.4 | A.5.19, A.5.22, A.5.23 | 25, 28(1) | 308(b)(1) |
| **Logging og overvåking** | | | | | | | |
| LG-01 | Revisjonslogg: hvem, hva, når. Kan ikke endres, og har lagringstid | T | A | CC7.2 | A.8.15, A.5.33 | 5(2), 32 | 312(b), 312(c)(1) |
| LG-02 | Overvåking og varsling på feil og mistenkelig aktivitet | T | A, E | CC7.2, CC7.3 | A.8.16 | 32 | 308(a)(1)(ii)(D) |
| **Hendelser** | | | | | | | |
| IR-01 | Hendelsesrutine: oppdage, vurdere, håndtere, lære | O | E | CC7.3, CC7.4, CC7.5 | A.5.24–A.5.27 | 32, 33(5) | 308(a)(6) |
| IR-02 | Brudd på personopplysningssikkerheten: varsling innen 72 timer og avviksregister | O | E | CC7.4, P6.3, P6.6 | A.5.26, A.6.8 | 33, 34 | 400–414 |
| IR-03 | Mottak av sårbarheter, og frister for retting | O | A, E | CC7.1, CC2.3 | A.8.8 | 32 | 308(a)(1)(ii)(B) |
| **Endringsstyring** | | | | | | | |
| CM-01 | Endringer kan spores: krav → commit → test → godkjenning | T | A, H | CC8.1 | A.8.32 | 5(2) | 308(a)(8) |
| CM-02 | Beskyttet hovedgren, pull request og påkrevde CI-sjekker | T | **H**, CI, E | CC8.1 | A.8.4, A.8.32 | 32 | – |
| CM-03 | Bevis per funksjon i bevisloggen | T | H, A | CC4.1, CC8.1 | A.5.36 | 5(2), 24 | 316(b)(1) |
| CM-04 | Utrulling og tilbakerulling er dokumentert og kan gjentas | T | A | CC8.1 | A.5.37, A.8.9 | 32 | – |
| **AI og språkmodeller** | | | | | | | |
| AI-01 | AI-leverandøren er registrert som databehandler, uten trening på kundedata | O | A, E | CC9.2 | A.5.19, A.5.23 | 28, 44–49 | 308(b)(1) |
| AI-02 | Minst mulig personopplysninger i prompter | T | A, H | C1.1, P4.1 | A.5.34, A.8.11 | 5(1)(c), 9, 25 | 502(b) |
| AI-03 | Upålitelig innhold er data, aldri instrukser. Modellen virker bare gjennom verktøy serveren kontrollerer | T | A | CC6.1, PI1.2 | A.8.26, A.8.28 | 32 | 312(c)(1) |
| AI-04 | Åpenhet om at det er AI, og vei til et menneske | T | A | P1.1 | A.5.34 | 13(2)(f), 22 | – |
| AI-05 | Prompter og svar følger lagringstid og tilgangsregler | T | A | C1.2, P4.2 | A.8.10, A.8.15 | 5(1)(e), 32 | 312(b) |
| **Organisasjon (din prosess)** | | | | | | | |
| ORG-01 | Kort policy for sikkerhet og personvern, eid og datert | O | E | CC5.3 | A.5.1 | 24(2) | 316(a) |
| ORG-02 | Risikovurdering og risikoregister, gjennomgått minst årlig | O | A, E | CC3.1–CC3.4 | pkt. 6.1.2 og 8.2 | 32(2), 35 | 308(a)(1)(ii)(A)–(B) |
| ORG-03 | Roller og ansvar, også hvem som er behandlingsansvarlig | O | E | CC1.3 | A.5.2 | 24, 28 | 308(a)(2) |
| ORG-04 | Årlig gjennomgang av kontroller, tilganger og eiendeler | O | E | CC4.1, CC4.2 | A.5.18, A.5.35, A.5.36 | 24(1), 32(1)(d) | 308(a)(8) |
| ORG-05 | Taushetsplikt og opplæring for alle med tilgang | O | E | CC1.4, CC2.2 | A.6.3, A.6.6 | 28(3)(b), 32(4) | 308(a)(5) |
| **Bare når HIPAA er på** | | | | | | | |
| HX-01 | Kart over PHI og regelen om «minimum necessary» | T | A | – | – | – | 502(b), 514(d) |
| HX-02 | Business Associate Agreement med alle som berører PHI | O | E | – | – | – | 308(b)(1), 314(a), 502(e) |
| HX-03 | Automatisk utlogging og nødtilgang | T | A | – | – | – | 312(a)(2)(ii)–(iii) |

**Fordeling:** 31 tekniske og 17 organisatoriske i kjernen. Tre har blokkering i hook: SDL-02 og AC-03 i stoppvakten, SDL-02 og CM-02 i `git-guard`. Seks har advarsel i hook. Resten vurderes av agenten eller av deg.

**Flere rammeverk senere:** Normen (helse i Norge) og UAE PDPL legges inn som nye nøkler i `map` og egne oppføringer i `frameworks.json`. De får egne kontroller bare der kjernen ikke dekker kravet, slik HX-kontrollene gjør for HIPAA.

### 5.3 Seks kontroller skrevet helt ut

```json
{
  "id": "SDL-02",
  "title": "Ingen hemmeligheter i kode eller git",
  "kind": "technical",
  "requirement": "Nøkler, passord og tokens ligger aldri i kildekode, konfigurasjon i git, testdata eller logger. De ligger i miljøvariabler eller et hemmelighetslager. En nøkkel som har vært i git, regnes som lekket og roteres.",
  "map": { "soc2": ["CC6.1"], "iso27001": ["A.5.17", "A.8.28"], "gdpr": ["32"], "hipaa": ["164.308(a)(5)(ii)(D)"] },
  "triggers": ["always"],
  "checks": [
    { "type": "hook", "id": "secrets", "severity": "block" },
    { "type": "ci", "id": "gitleaks" }
  ],
  "evidence": ["CI-kjøring med gitleaks uten funn", ".gitignore dekker .env*", "rotasjonsnotat hvis en nøkkel har lekket"],
  "askInSpec": ["Trenger funksjonen en ny nøkkel? Hvor lagres den, og hvem roterer den?"]
}
```

```json
{
  "id": "AC-03",
  "title": "Kundeskille i datalaget: hver ny tabell får radbasert tilgangskontroll",
  "kind": "technical",
  "requirement": "Databasen selv holder kundene fra hverandre, også når koden glemmer å filtrere. Hver ny tabell med kundedata får RLS slått på og minst én regel i samme migrasjon. Appen kobler seg til med en rolle som ikke kan gå utenom reglene.",
  "map": { "soc2": ["CC6.1", "C1.1"], "iso27001": ["A.8.3"], "gdpr": ["25", "32"], "hipaa": ["164.312(a)(1)"] },
  "triggers": ["db-schema"],
  "appliesWhen": { "profile": "datastore.rls.required" },
  "checks": [
    { "type": "hook", "id": "rls", "severity": "block" },
    { "type": "ci", "id": "rls-test", "note": "prosjektets egen test som feiler når en tabell mangler regel" }
  ],
  "evidence": ["migrasjonsfilen", "bestått RLS-test med kommando og resultat"],
  "askInSpec": ["Hvilke nye tabeller? Hvem skal kunne se radene: bedriften, plattformen, ingen?"]
}
```

```json
{
  "id": "DP-06",
  "title": "Ingen personopplysninger eller hemmeligheter i logger, feilmeldinger og analyse",
  "kind": "technical",
  "requirement": "Logger, feilmeldinger, sporingsverktøy og analyse inneholder ikke navn, telefonnummer, e-post, fritekst fra brukere, tokens eller helseopplysninger. Logg en intern ID i stedet. Trengs innholdet til feilsøking, maskeres det og får egen lagringstid.",
  "map": { "soc2": ["C1.1"], "iso27001": ["A.8.11", "A.8.12", "A.8.15"], "gdpr": ["5(1)(c)", "5(1)(f)", "32"], "hipaa": ["164.502(b)"] },
  "triggers": ["logging", "personal-data", "api", "ai"],
  "checks": [
    { "type": "hook", "id": "pii-logs", "severity": "warn", "note": "feltnavn hentes fra datakartet" },
    { "type": "agent", "id": "log-review" }
  ],
  "evidence": ["liste over nye loggkall og hva de skriver", "test som viser maskert utdata der det finnes"],
  "askInSpec": ["Hva logges i denne funksjonen? Hvilke felt er utelatt eller maskert?"]
}
```

```json
{
  "id": "PR-05",
  "title": "Retting, sletting, begrensning og innsigelse kan oppfylles",
  "kind": "technical",
  "requirement": "For hver ny datatype om en person finnes det en vei til å rette og slette den for én person, uten håndarbeid i databasen. Sletting dekker også kopier: køer, mellomlagre, søkeindekser, leverandører og sikkerhetskopier (ved utløp). Hver forespørsel logges med dato og utfall.",
  "map": { "soc2": ["P5.2", "P4.3"], "iso27001": ["A.5.34", "A.8.10"], "gdpr": ["16", "17", "18", "19", "21"], "hipaa": ["164.526"] },
  "triggers": ["personal-data", "db-schema", "third-party"],
  "checks": [ { "type": "agent", "id": "rights-path" } ],
  "evidence": ["test som sletter én person og viser at radene er borte i alle tabeller fra datakartet", "rutine for forespørsler med frist på én måned"],
  "askInSpec": ["Hvor lagres den nye opplysningen, også kopier? Hvordan slettes den for én person?"]
}
```

```json
{
  "id": "AI-02",
  "title": "Minst mulig personopplysninger i prompter",
  "kind": "technical",
  "requirement": "Språkmodellen får bare det oppgaven trenger. Identifikatorer byttes med interne ID-er der det går. Særlige kategorier (helse og lignende) sendes ikke uten dokumentert grunnlag og avtale. Det er skrevet ned hvilke felt som går til modellen, og hvorfor.",
  "map": { "soc2": ["C1.1", "P4.1"], "iso27001": ["A.5.34", "A.8.11"], "gdpr": ["5(1)(c)", "9", "25"], "hipaa": ["164.502(b)"] },
  "triggers": ["ai", "personal-data"],
  "checks": [
    { "type": "agent", "id": "prompt-fields" },
    { "type": "hook", "id": "pii-logs", "severity": "warn", "note": "samme feltliste brukt på filer som bygger prompter" }
  ],
  "evidence": ["tabell i datakartet: felt → sendes til modell ja/nei → begrunnelse", "leverandøren står i leverandørregisteret (AI-01)"],
  "askInSpec": ["Hvilke felt sendes til modellen? Kan noen fjernes eller maskeres?"]
}
```

```json
{
  "id": "IR-02",
  "title": "Brudd på personopplysningssikkerheten: varsling innen 72 timer og avviksregister",
  "kind": "organisational",
  "requirement": "Du har en skrevet rutine som sier hvem som vurderer et brudd, hvordan Datatilsynet varsles innen 72 timer, når de berørte varsles, og hvordan kunder varsles når du er databehandler. Alle avvik føres i et register, også de som ikke meldes.",
  "map": { "soc2": ["CC7.4", "P6.3", "P6.6"], "iso27001": ["A.5.26", "A.6.8"], "gdpr": ["33", "34"], "hipaa": ["164.404", "164.408", "164.410"] },
  "triggers": ["periodic"],
  "checks": [ { "type": "owner", "id": "breach-routine", "remindEvery": "P12M" } ],
  "evidence": ["rutinedokument med dato", "avviksregister (kan være tomt, men må finnes)", "notat fra én øvelse i året"],
  "askInSpec": []
}
```

---

## 6. Filer i hvert prosjekt

Alt ligger i `compliance/` i roten av repoet. Bare data, aldri skills eller skript. **Regel: pek, ikke kopier.** Finnes dokumentet alt et annet sted, peker profilen dit.

```text
compliance/
├── profile.json          # hva som gjelder for dette prosjektet
├── controls.json         # status per kontroll
├── data-map.json         # datakart = grunnlag for protokollen (GDPR art. 30)
├── risks.json            # risikoregister
├── exceptions.json       # unntak fra hook-sjekkene, med begrunnelse
├── GAP-REPORT.md         # fra baseline, datert
└── evidence/
    └── 2026-11-20-kunde-sletting.md
project/                  # plan, tavle og steg (del 7.2)
.github/                  # maler, dependabot.yml, workflows/ci.yml og security.yml (del 6A.4)
```

### 6.1 `profile.json`

Eksempel slik den kunne sett ut for et syntetisk prosjekt, «Eksempel Booking AS» (en booking-app for flere kunder med Postgres RLS, OIDC-innlogging, SMS-leverandør og AI-modell):

```json
{
  "schema": 1,
  "catalogVersion": "0.1.0",
  "project": "eksempel-booking",
  "dataClass": "personal",
  "role": ["processor", "controller"],
  "frameworks": { "gdpr": true, "iso27001": true, "soc2": true, "hipaa": false },
  "frameworkCandidates": ["helse-norge"],
  "datastore": {
    "engine": "postgres",
    "rls": { "required": true, "migrationGlobs": ["db/migrations/*.sql"], "exemptTables": ["schema_migration"] }
  },
  "ai": { "used": true, "providers": ["ai-leverandor"] },
  "workflow": { "taskList": "docs/TASKS.md", "agentRules": "AGENTS.md", "boardDir": "project" },
  "github": {
    "repo": "eksempel/booking", "visibility": "private",
    "flow": "trunk",
    "attribution": "forbid",
    "agentMay": { "commit": true, "push": "branch", "openPr": true, "merge": false, "release": false },
    "requiredCheck": "gate"
  },
  "git": { "explicitPaths": true },
  "rollout": { "commands": ["docker compose -f docker-compose.prod.yml *"], "pilotGroup": "pilotkunder" },
  "artefacts": {
    "ropa": "docs/privacy/ROPA.md",
    "dpia": "docs/privacy/DPIA.md",
    "subprocessors": "docs/privacy/SUBPROCESSORS.md",
    "dpa": "docs/privacy/DPA.md",
    "breachRegister": "docs/privacy/BREACHES.md",
    "incidentRoutine": "docs/INCIDENTS.md"
  },
  "notApplicable": { "PR-03": "Ingen behandling bygger på samtykke utenom piloten." },
  "baseline": { "date": "2026-11-20", "commit": "a1b2c3d" }
}
```

`github.flow` er `trunk` her fordi eksempelprosjektet i dag pusher rett til hovedgrenen. Profilen beskriver virkeligheten. Den endres til `pr` når du bestemmer det (del 8.7). Nye prosjekter starter på `pr`. Om repoet er privat, er en antakelse i eksempelet. Baseline leser det fra GitHub.

`init` spør om seks ting: hva slags data, er du behandlingsansvarlig eller databehandler, hvilke rammeverk, database og RLS, brukes AI, og hvor oppgavelisten ligger.

### 6.2 `controls.json` (statustabell)

```json
{
  "AC-03": { "status": "met", "evidence": ["db/migrations/0009_rls.sql", "test/rls.test.ts"],
             "source": "code-read", "reviewed": "2026-11-20", "by": "agent" },
  "SDL-04": { "status": "gap", "note": "Ingen CI i repoet. Ingen skanning av avhengigheter, ingen SBOM.",
              "source": "code-read", "reviewed": "2026-11-20", "by": "agent", "task": "docs/TASKS.md#S-20" }
}
```

Status: `met`, `partial`, `gap`, `n/a`, `unknown`. `unknown` er ærlig og tillatt. Tre tilstander holdes fra hverandre, slik project-init gjorde: **profil finnes** → **gjennomgang gjort** → **kontroll møtt med bevis**. Den ene betyr ikke den neste.

### 6.3 `data-map.json` (datakart og protokoll)

```json
{
  "controller": "Eksempel Booking AS (for egne brukere) / kunden (for sluttkunder)",
  "activities": [
    {
      "id": "booking",
      "purpose": "Bestille og endre timer",
      "lawfulBasis": "avtale (art. 6(1)(b))",
      "subjects": ["sluttkunder"],
      "fields": ["name", "phone", "email", "details"],
      "specialCategories": false,
      "stores": ["postgres:booking"],
      "retention": "365 dager etter timen",
      "recipients": ["sms-leverandor (sms)", "ai-leverandor (samtaletekst)"],
      "transfers": [{ "to": "USA", "basis": "må avklares" }],
      "sentToModel": ["name", "phone"],
      "erasurePath": "se PR-05-beviset"
    }
  ]
}
```

`fields` brukes av stoppvakten til DP-06. Kolonnene følger art. 30: formål, kategorier, mottakere, overføringer, slettefrister, sikkerhetstiltak.

### 6.4 `risks.json`

```json
[ { "id": "R-01", "risk": "Kundedata lekker mellom bedrifter", "likelihood": 2, "impact": 5,
    "controls": ["AC-03", "AC-04", "SDL-05"], "treatment": "redusere", "owner": "eier",
    "status": "åpen", "reviewed": "2026-11-20" } ]
```

### 6.5 Bevisfil per funksjon

```markdown
# 2026-11-20 · kunde-sletting
<!-- forge:evidence {"feature":"kunde-sletting","task":"docs/TASKS.md#PR-12",
     "controls":["PR-05","DP-05","LG-01"],"commit":"abc1234"} -->

| Kontroll | Hva ble gjort | Kommando | Resultat | Kilde |
| --- | --- | --- | --- | --- |
| PR-05 | Sletting av én kunde i alle tabeller | `npm test -- rights` | 14 bestått, 0 feilet | local-run |
| LG-01 | Slettingen står i revisjonsloggen | `npm test -- audit` | 6 bestått | local-run |

**Ikke prøvd:** sletting hos SMS-leverandøren. Krever ekte konto. Står i `docs/OWNER-CHECKLIST.md`.
```

Seksjonen «Ikke prøvd» er påkrevd. Tom seksjon skal skrives som «Ingenting».

### 6.6 CI-maler (`.github/workflows/ci.yml` og `security.yml`)

`ci.yml` kjører prosjektets egne sjekker på pull request, med stifiltre og samlejobben `gate` (del 6A.4). `security.yml` har fire jobber, hver med minste rettigheter (`permissions: contents: read`). Den kjører på pull request når kode eller avhengigheter er endret, og én gang i uka:

| Jobb | Verktøy | Kontroll | Bevis |
| --- | --- | --- | --- |
| Hemmeligheter | gitleaks | SDL-02 | Logg fra kjøringen |
| Avhengigheter | osv-scanner (og `npm audit --audit-level=high` der det passer) | SDL-04 | Rapport som artefakt |
| SBOM | CycloneDX | SDL-04 | `sbom.json` som artefakt |
| SAST | semgrep | SDL-05 | SARIF som artefakt |

Alle `uses:` låses til full commit-SHA (hentet fra project-init spec 009). SHA-ene slås opp når malen bygges, og en test feiler hvis en tag står igjen. Prosjektets egne tester (for eksempel RLS-testen) ligger i `ci.yml`. Ingen av de fire verktøyene krever betalte GitHub-funksjoner, så de virker også i private repoer på gratisplan. CodeQL legges til bare der `github-setup` finner at det er tilgjengelig.

---

## 6A. GitHub som et ordentlig utviklingslag

Krav fra eieren: GitHub skal brukes profesjonelt i alle prosjekter. Tre lag, fra sterkest til svakest. Hentet fra project-init spec 007 (lokale sjekker først), 008 (GitHub-pakken) og 009 (forsyningskjede).

### 6A.1 Hvilken regel bor hvor

| Regel | A · GitHub-innstilling | B · Lokal hook | C · Skill og maler |
| --- | --- | --- | --- |
| Ingen direkte push til `main` | Regelsett: krev PR | Nekter `git push` til `main`/`master` | Forklarer flyten |
| Ingen tvangspush, ingen sletting av `main` | Regelsett | Nekter `--force` og `-f` | – |
| CI må være grønn før sammenslåing | Regelsett: påkrevd statussjekk | – | PR-malen viser status |
| Rett historikk, squash | Regelsett og repo-innstilling | – | Regel for commit-meldinger |
| Slett gren etter sammenslåing | Repo-innstilling | – | – |
| Hemmeligheter stoppes | Hemmelighetsskanning og push-vern (der det finnes) | Nekter commit med treff | gitleaks i CI |
| Sårbare avhengigheter | Dependabot-varsler og sikkerhetsoppdateringer | Advarsel ved endret låsefil | `dependabot.yml`, osv-scanner i CI |
| Statisk analyse | CodeQL (der det finnes) | – | semgrep i CI |
| Aldri `--no-verify` | – | Nekter | – |
| Aldri `git commit -a` eller `git add -A` | – | Nekter (andre økter kan dele mappen) | Regel: eksplisitte stier |
| Aldri sammenslåing uten eierens ja | – | Nekter `gh pr merge` uten godkjent utrulling | Flyten stopper og spør |
| Grennavn, commit-meldinger, PR knyttet til sak | – | – | `github-flow` |

**Ærlig om lagene:** A gjelder alle, også Codex og deg selv i terminalen. B gjelder bare Claude Code, og bare kommandoer hooken klarer å lese. C er kunnskap, ikke håndheving.

### 6A.2 Lag A: innstillinger på GitHub

Kommandoen `/forge:github-setup` kjører `scripts/github-setup.mjs`. Den **prøver seg frem med `gh api`** og leser svaret, i stedet for å anta hva kontoen har. Den viser en forhåndsvisning (innstilling → i dag → forslag → tilgjengelig?) og endrer ingenting før du har godkjent (samme godkjenningsmekanisme som i del 7.4).

| Innstilling | Tilgjengelighet (kontrollert 18.11.2026 mot docs.github.com) |
| --- | --- |
| Hemmelighetsskanning og push-vern | Offentlige repoer: på som standard. Private: krever GitHub Secret Protection, som tilbys Team og Enterprise Cloud |
| «Push protection for users» | Alle planer, men bare for push til offentlige repoer |
| Dependabot-varsler, sikkerhetsoppdateringer og versjonsoppdateringer | Alle planer |
| CodeQL og avhengighetsgjennomgang | Offentlige repoer: tilgjengelig. Private: krever GitHub Code Security (Team og Enterprise Cloud) |
| Regelsett og grenbeskyttelse | **Ikke bekreftet fra siden jeg hentet** (plan-boksen var ikke med i teksten). Etter det jeg vet: gratis i offentlige repoer, og krever GitHub Pro eller høyere i private repoer på personlig konto. Oppsettskommandoen avgjør dette ved å prøve |

Regelsettet på standardgrenen: krev pull request (0 påkrevde godkjenninger), krev statussjekken `gate`, blokker tvangspush, blokker sletting, krev rett historikk. Repo-innstillinger: bare squash-sammenslåing, slett gren automatisk. Ingen på omgåelseslisten.

**Alene-eier, sagt rett ut:** GitHub lar deg ikke godkjenne din egen pull request. Påkrevd menneskelig godkjenning er derfor umulig for deg. Porten er i stedet: **CI er grønn**, **agentens uavhengige gjennomgang står som kommentar på PR-en**, og **du sier ja til sammenslåing**. Det er en reell kontroll, men det er ikke firedobbelt kontroll, og en revisor vil spørre om det. Svaret er dette avsnittet og bevisene.

**Eierens plan (besluttet):** gratis GitHub, ingen Pro. Regelsett, push-vern og CodeQL finnes derfor bare i offentlige repoer. Oppsettet velger per repo: offentlig betyr lag A fullt, privat betyr lag B og CI.

**Når innstillingene ikke finnes** (privat repo på gratisplan): lag B og CI bærer mer. Hooken nekter push til `main`. gitleaks og semgrep i CI erstatter push-vern og CodeQL. Dependabot virker uansett. Gap-rapporten sier tydelig at CM-02 da er `partial`, og hvorfor.

### 6A.3 Lag B: `git-guard.mjs` (PreToolUse)

Én hook med matcher `Bash|PowerShell` og `if` satt til `Bash(git *)`, `Bash(gh *)`, `PowerShell(git *)` og `PowerShell(gh *)` (én behandler per regel, fordi `if` bare tar én). Skriptet leser kommandoen og nekter med `permissionDecision: "deny"` og en grunn i klarspråk.

| Nekter | Betingelse |
| --- | --- |
| `git push` til `main`/`master` | Bare når profilen sier `github.flow: "pr"` |
| `git push --force` og `-f` | Alltid. `--force-with-lease` tillates på egen gren |
| `--no-verify` på commit og push | Alltid |
| `git commit -a`, `git add -A`, `git add .`, `git add -u` | Når `git.explicitPaths: true` (standard) |
| `git commit` når det som er lagt til, treffer et hemmelighetsmønster | Alltid (samme sjekk som SDL-02) |
| `gh pr merge` og utrullingskommandoer | Til utrulling er godkjent for steget (del 7.4) |

Budsjett under 150 ms. **Feil i skriptet slipper gjennom med advarsel. Et treff nekter alltid.** Begrensning: git startet fra et skript eller et alias ser ikke hooken. Derfor er lag A det som teller. At matcheren fyrer for PowerShell-verktøyet, kontrolleres i fase 0.

### 6A.4 Lag C: skillen `github-flow`

Kunnskap og maler. Flyten:

```text
sak (issue) → gren → små commits → pull request fra mal → CI → gjennomgang → squash → slett gren → endringslogg/utgivelse
```

- **Gren:** `feat|fix|docs|chore|refactor|test/<saksnr>-<kort-navn>`, for eksempel `feat/12-endre-telefon`.
- **Commit:** Conventional Commits (`feat: …`, `fix: …`). Små, med eksplisitte stier.
- **Pull request:** fra mal, med `Closes #12`, hva som er gjort, bevisdelen (kommando og faktisk resultat) og «Ikke prøvd».
- **Tilskriving:** profilen har `github.attribution: forbid|allow|require`. Standard følger innstillingen din i dag (`includeCoAuthoredBy: false`).
- **Agentens fullmakt:** profilen sier hva agenten får gjøre: `commit`, `push` (bare egen gren), `openPr`. `merge` og `release` er alltid `false` uten ditt ja for det steget.

**Sjekkliste for repoet**, opprettet av `init` og kontrollert av `baseline`. Hver fil vises som forslag og legges inn bare med godkjenning:

| Fil | Merknad |
| --- | --- |
| `README.md`, `CHANGELOG.md`, `.gitignore` | Alltid |
| `.gitattributes` | `* text=auto eol=lf`, og `eol=crlf` for `*.ps1`, `*.bat`, `*.cmd`. Viktig på Windows |
| `LICENSE` | Agenten **spør**. Åpen kildekode: anbefal Apache-2.0 eller MIT. Privat, kommersiell kode trenger ingen åpen lisens. Da utelates filen, eller den sier «Alle rettigheter forbeholdt» |
| `SECURITY.md`, `CONTRIBUTING.md`, `CODEOWNERS` | Alltid. `CODEOWNERS` peker på deg |
| `CODE_OF_CONDUCT.md` | Bare offentlige repoer |
| `.github/ISSUE_TEMPLATE/` (funksjon, feil), `.github/PULL_REQUEST_TEMPLATE.md` | Alltid |
| `.github/dependabot.yml` | Ukentlig, gruppert, også for GitHub Actions |
| `.github/workflows/ci.yml` og `security.yml` | Se under |

**CI bare når det trengs** (fra spec 007):

1. **Lokalt først.** Agenten kjører prosjektets raske sjekker (lint, typesjekk, enhetstester) før push. Den venter ikke på CI for å finne feil.
2. **CI på pull request**, ikke på hver push. `concurrency` med `cancel-in-progress`, hurtigbuffer for avhengigheter.
3. **Stifiltre.** Endres bare dokumentasjon, kjøres bare én rask jobb.
4. **Én påkrevd sjekk: `gate`.** En liten jobb som alltid kjører og samler resultatet fra de andre. Uten den blir en PR hengende når en påkrevd jobb hoppes over av et stifilter.
5. **Planlagt sikkerhetsskanning** én gang i uka (`security.yml`), i tillegg til på PR når kode eller avhengigheter er endret.
6. Lokale sjekker merkes `local-run`. De erstatter ikke CI som bevis.

### 6A.5 GitHub i fasene

| Fase | GitHub |
| --- | --- |
| Plan | Sak opprettes eller lenkes. Steget på tavla får saksnummeret |
| Krav | «Krav fra kontrollene» legges i saken som sjekkliste |
| Bygg | Arbeid på gren. Små commits |
| Sjekk | Lokale sjekker → push av gren → PR fra mal → CI → `reviewer` legger gjennomgangen som kommentar på PR-en |
| Rull ut | Du godkjenner → squash-sammenslåing → gren slettes → merke og utgivelse når det passer → utrulling bak egen port |
| Tilbakemelding | Saken lukkes av `Closes #n`. Det som ble lært, blir nye saker |

Agenten committer, pusher og åpner PR bare når prosjektets flyt og fullmakt sier det. Den slår aldri sammen uten ditt ja.

---

## 7. Fabrikkflyten

### 7.1 Sju faser, gjentatt i små steg

Dette er en løkke, ikke en foss. Hvert steg er lite: én ting en bruker kan prøve. Fasene har norske navn i alt du leser, og engelske navn i koden.

| # | Fase (kode) | Hva skjer, i klarspråk | Driver | Lager |
| --- | --- | --- | --- | --- |
| 1 | **Plan** (`plan`) | Første gang: hva prosjektet er, hvem det er for, hovedflyten, målet og hvordan vi måler det, hvilke data det håndterer. Senere: hva akkurat dette steget skal gi. Agenten stiller høyst fem enkle spørsmål om gangen | `flow` · Opus (Fable via `architect` for ny arkitektur) | `project/PLAN.md`, `steps/S-nnn/step.md`, sak på GitHub |
| 2 | **Krav** (`requirements`) | Kravene som følger av planen og profilen, og risiko. Nytt prosjekt: `init`. Eksisterende prosjekt første gang: `baseline`. Hvert steg: `gate` | `compliance-guard` | «Krav fra kontrollene» i `step.md`, risikoregister |
| | **PORT 1** | **Du godkjenner omfanget.** Ingen kode før dette | Du | |
| 3 | **Design** (`design`) | Bare når steget har skjerm. Retning, skjermer og tilstander før kode. Du får se det | `ui-ux-pro-max`, `impeccable` | `steps/S-nnn/design.md` |
| 4 | **Bygg** (`build`) | En liten bit eller pilot. På egen gren | `model-router` → `builder` eller hovedøkt | Kode, tester, commits |
| 5 | **Sjekk** (`verify`) | Tester, sikkerhet, bevis for kravene, UI-gjennomgang og skjermbilder, uavhengig gjennomgang, PR og CI | `compliance-guard evidence`, `reviewer`, `impeccable` | Bevisfil, `review.md`, PR |
| | **PORT 2** | **Du godkjenner utrulling.** | Du | |
| 6 | **Rull ut** (`rollout`) | Til en pilotgruppe. Aldri automatisk. Det som krever ekte telefon eller ekte brukere, tester du selv | Du, med sjekkliste fra agenten | `steps/S-nnn/rollout.md` |
| 7 | **Tilbakemelding** (`feedback`) | Samle tilbakemelding, skriv ned hva vi lærte, velg neste steg | `flow` | `steps/S-nnn/feedback.md` → tilbake til 1 |

Vil du endre omfanget etter port 1, går steget tilbake til Plan. Feiler Sjekk, går det tilbake til Bygg, høyst to ganger. Deretter stopper agenten og spør deg (hentet fra Factorys `max_fix_rounds`).

**Hurtigspor for småfeil:** et steg av typen `fix` har Plan og Krav på én linje hver. Port 1 gjelder fortsatt, men du kan godkjenne i samme melding.

**Krav og UI-regler er ikke bare faser.** Hooks håndhever dem i alle faser (del 3 og 6A).

### 7.2 Tavla: slik lagres fasen

I repoet, slik at den følger prosjektet på tvers av økter, maskiner og agenter. Mappen kan flyttes med `workflow.boardDir` i profilen.

```text
project/
├── PLAN.md            # prosjektplanen (fase 1)
├── board.json         # maskinlesbar tilstand. Skrives bare av tavlehjelperen
├── STATUS.md          # lesbar status for deg. Lages av hjelperen
└── steps/
    └── S-003-endre-telefon/
        ├── step.md  design.md  review.md  rollout.md  feedback.md
```

Bevisfilen ligger fortsatt i `compliance/evidence/`. Revisor leser den mappen.

```json
{
  "schema": 1,
  "current": "S-003",
  "steps": [
    {
      "id": "S-003", "title": "Kunden kan endre telefonnummer", "type": "feature",
      "phase": "verify", "hasUi": true, "fixRound": 0,
      "issue": 12, "branch": "feat/12-endre-telefon", "pr": 14,
      "task": "docs/TASKS.md#AS-18",
      "controls": ["DP-04", "DP-06", "PR-05", "AC-02", "LG-01"],
      "gates": {
        "scope":   { "approved": true,  "at": "2026-11-20T09:12:00Z", "by": "owner" },
        "rollout": { "approved": false }
      },
      "evidence": "compliance/evidence/2026-11-20-endre-telefon.md",
      "waitingOn": "agent",
      "missing": ["uavhengig gjennomgang"],
      "learned": null
    }
  ]
}
```

`STATUS.md`, slik du ser den:

```markdown
# Status · Eksempel Booking · oppdatert 20.11.2026 10:40

## Nå
**S-003 · Kunden kan endre telefonnummer** · fase **5 Sjekk** · venter på: agenten
- [x] Plan  [x] Krav  [x] Omfang godkjent 20.11.  [x] Design  [x] Bygg
- [ ] Sjekk: tester bestått (14/14), bevis skrevet, **mangler uavhengig gjennomgang**
- [ ] Utrulling godkjent  [ ] Rull ut  [ ] Tilbakemelding

**Neste:** skriv `/forge:next`. Når Sjekk er ferdig, ber agenten deg godkjenne utrulling.

## Ferdig
- S-002 · SMS-kode før endring · lært: «innringere leser ikke koden høyt uten å bli bedt om det»
```

### 7.3 Tavlehjelperen og «ikke ferdig uten bevis»

`board.mjs` er den eneste som skriver tavla (hentet fra Factory: bare gjennom hjelperen). Den nekter ugyldige flytt:

| Flytt | Krever |
| --- | --- |
| Krav → Design eller Bygg | Port 1 godkjent |
| Design → Bygg | `design.md` finnes (bare når `hasUi`) |
| Bygg → Sjekk | Ingen krav. Sjekk er der mangler blir funnet |
| **Sjekk → Rull ut** | Bevisfil med kommando og faktisk resultat for hver kontroll i steget, seksjonen «Ikke prøvd», `review.md` fra `reviewer` (en annen agent enn den som bygde, med ny kontekst), grønn CI for siste commit når repoet har CI, UI-gjennomgang når `hasUi`, og port 2 godkjent |
| Rull ut → Tilbakemelding | `rollout.md` sier hvem som fikk det, og hva du selv testet |
| Tilbakemelding → ferdig | Minst én linje i `learned`, og et valg: neste steg eller stopp |

Dette er vakten fra project-init v2, uten hash-kjedene. Den sjekker at bevisene **finnes og er ferske**, ikke at de er sanne. Sannheten ligger i CI og hos deg.

Punkter som krever ekte telefon, mobil eller lyd, kan agenten aldri krysse av. De står som «eier tester» til du selv bekrefter dem.

### 7.4 Godkjenning som agenten ikke kan gi seg selv

En godkjenning registreres bare når **du** skriver `/forge:approve scope` eller `/forge:approve rollout` (eller «godkjenner omfang» / «godkjenner utrulling»). `UserPromptSubmit`-hooken ser din egen melding og legger et engangsmerke i øktminnet, utenfor repoet. `board.mjs approve` krever merket. Agenten kan ikke skrive en melding i ditt navn, så den kan ikke lage merket.

Begrensning: agenten kan fortsatt redigere `board.json` direkte. Hjelperen fører egen logg i `${CLAUDE_PLUGIN_DATA}`, og stoppvakten varsler når tavla og loggen ikke stemmer. Det er sporbart, ikke umulig å omgå.

### 7.5 Kommandoer

| Kommando | Gjør |
| --- | --- |
| `/forge:plan` | Starter et nytt steg i fase Plan. Første gang: prosjektplanen |
| `/forge:next` | Gjør det neste i gjeldende fase, eller sier hva som venter på deg |
| `/forge:status` | Viser `STATUS.md`, åpne gap og åpne advarsler |
| `/forge:approve scope` / `rollout` | Dine to porter |
| `/forge:feedback` | Tar imot tilbakemelding og avslutter steget |
| `/forge:enroll`, `/forge:baseline`, `/forge:github-setup`, `/forge:hotfix` | Engangsoppsett per prosjekt |

Du trenger sjelden kommandoene. Skriver du bare «jeg vil at kunden skal kunne endre telefonnummeret», starter ruteren Plan for deg.

### 7.6 Slik fortsetter en økt i riktig fase

`SessionStart` leser tavla og legger inn aktivt steg, fase, hva som mangler og hvem det venter på (del 3.1). Ruteren gjentar fasen i én linje ved hver melding. Ber du om kode mens port 1 ikke er godkjent, står det: «Omfang er ikke godkjent. Fullfør Plan og Krav først.» Codex leser `project/STATUS.md` (del 7.9).

### 7.7 Nytt og eksisterende prosjekt

**Nytt prosjekt:** `SessionStart` sier «Ingen profil og ingen tavle». `project-start` starter fase Plan. Fase Krav kjører `init`: seks spørsmål, profil, maler, forslag til repo-filer og `/forge:github-setup`. Du godkjenner hver del.

**Eksisterende prosjekt («Eksempel Booking AS» som eksempel):**

1. Første økt: «Ingen profil. Kjør baseline før du endrer noe.»
2. `explorer` (Haiku) kartlegger: migrasjoner, innlogging, logging, leverandører, dokumenter, CI, repo-filer.
3. `compliance-guard baseline` (Opus) vurderer hver kontroll og skriver `GAP-REPORT.md`. Ingen kildekode endres.
4. Du leser rapporten. Gapene du velger, blir steg på tavla.

**Slik ville rapporten trolig sett ut.** Dette er en illustrasjon bygget på filnavn og utdrag jeg har lest (`code-read`), ikke en gjennomført baseline:

| Funn | Kontroller | Grunnlag |
| --- | --- | --- |
| Trolig møtt | AC-01, AC-03, AC-04, AC-05, AC-06, DP-05, LG-01, PR-04/05, VN-01/02, PR-06, IR-01/02, SDL-06 | `0009_rls.sql` og `rls.test.ts`, OIDC-oppsett og `src/auth/oidc.ts`, `0110_retention.sql`, `0017_audit_immutable.sql`, `0113_customer_rights.sql`, `0112_support_access.sql`, `docs/privacy/*`, `docs/INCIDENTS.md`, `security/` |
| Gap | SDL-04, SDL-05 (SAST), CM-02 | Repoet har ingen `.github/`. Ingen CI, ingen skanning, ingen SBOM. Arbeid pushes rett til `main` |
| Gap, repo-filer | – | Ingen `README`, `SECURITY.md`, `CODEOWNERS`, `CHANGELOG` eller maler i roten. `.gitattributes` dekker bare `deploy/*.sh` |
| Delvis | SDL-02 | `security/scan-history.sh` finnes lokalt, men ikke i CI |
| Ukjent | ORG-01, ORG-02, ORG-04, BK-01 (gjenoppretting testet?) | Ikke funnet i repoet. Kan finnes hos deg |
| Å avklare | VN-03, AI-01 | `docs/privacy/README.md` sier selv at AI-leverandøren og SMS-leverandøren ikke står riktig i tekstene |
| Rammeverk | Helse-Norge som kandidat | `docs/HEALTH-ANNEX.md`, landfelt i registrering |

Poenget: eksempelprosjektet har alt mye på plass. Baseline skal **kartlegge det som finnes**, ikke lage en parallell bunke dokumenter.

### 7.8 Slik passer det med vanene dine

- **Spec først** er port 1. `step.md` er specen for steget.
- **`docs/TASKS.md`** er fortsatt oppgavelisten der den finnes. Tavla holder bare fase og porter, og peker på oppgaven (`task`). I nye prosjekter er tavla listen.
- **«Vis bevis»**-regelen din og bevisfilen er samme ting. Kommando og faktisk resultat.
- **«Eieren tester selv»** er bygget inn i fase Rull ut.
- **Prosjektregler vinner.** AGENTS.md i prosjektet kan være strengere enn katalogen flere steder. Katalogen legger til, den overstyrer ikke.

### 7.9 Codex (minimum i v1)

Hooks finnes ikke i Codex. Derfor får prosjektet et utdrag i `AGENTS.md`, mellom markører, lagt inn bare med din godkjenning:

```markdown
<!-- forge:start -->
## Faser, krav og GitHub
- Les `project/STATUS.md` først. Arbeid bare på det aktive steget, i fasen som står der.
  Ikke skriv kode før omfanget er godkjent. Ikke endre `project/board.json` for hånd.
- Les `compliance/profile.json`. Den sier hvilke rammeverk og regler som gjelder.
- Berører oppgaven personopplysninger, database, innlogging, logging, leverandører eller AI:
  skriv hvilke kontroller som gjelder (se `compliance/controls.json`) i steget før du koder.
- Ny tabell: radbasert tilgangskontroll i samme migrasjon når profilen krever det.
- Aldri hemmeligheter i git. Aldri personopplysninger i logger.
- Git: egen gren, små commits med eksplisitte stier, pull request. Aldri push til `main`,
  aldri tvangspush, aldri `--no-verify`. Aldri sammenslåing eller utrulling uten eierens ja.
- Etter bygging: lag `compliance/evidence/<dato>-<navn>.md` med kommando, faktisk resultat og «Ikke prøvd».
- Si «bygget etter kravene», aldri «sertifisert» eller «compliant».
<!-- forge:end -->
```

Regelsettet på GitHub og CI fanger det samme for Codex som for Claude. Full likhet er ikke et mål i v1.

### 7.10 Hva vi henter fra den gamle Factory

| Henter nå | Venter til senere (fase 7) |
| --- | --- |
| Tavle som bare skrives gjennom en hjelper | Flere agenter som bygger samtidig i egne arbeidstrær |
| Ett steg = én mappe med spec, gjennomgang og beslutning | Integrasjonstre der grenene slås sammen før gjennomgang |
| Roller med fast modell: bygger, gjennomgår, godkjenner | Codex som arbeider side om side med Claude |
| Høyst to retterunder, så spør eieren | Egen risikovurdering per jobb |
| Stopp ved menneskets port. Aldri automatisk sammenslåing | Dashbord i nettleseren |

Factory-skriptene er Python (ca. 1 900 linjer). Vi skriver tavlehjelperen på nytt i Node, uten avhengigheter, og mye mindre.

---

## 8. Fra project-init, og opprydding

### 8.1 Hvorfor project-init ble for tungt

Målt i klonen: 180 filer, ca. 18 500 linjer, derav ca. 4 800 linjer egen CLI.

1. **Egen CLI og egen tilstand.** `.project-init/` hadde over ti filer per prosjekt. Det dupliserte det Claude Code alt har.
2. **Kopier i hvert prosjekt.** Skills ble kopiert inn i hvert repo, for både Claude og Codex. De drev fra hverandre.
3. **Måtte startes for hånd.** Sju skills som måtte kalles ved navn. De ble glemt.
4. **Håndhevingen ble aldri bygget.** Spec 004 (hooks) sto som utkast. Alt hvilte på at agenten husket reglene.
5. **Lukket ved minste endring.** Hash-kjeder gjorde at én redigert fil ugyldiggjorde godkjenningen.
6. **For bredt.** Tre spec-rammeverk, to agenter på likt nivå, skjermbildekontroll, fabrikk og 15 specs.

### 8.2 Hva vi tar med og hva vi lar ligge

| Tar med (som idé, ikke som fil) | Kilde |
| --- | --- |
| Forhåndsvisning før endring. Aldri overskriv `AGENTS.md` eller `CLAUDE.md`. Endringer bare mellom markører | INVARIANTS PI-003, PI-020 |
| Tre adskilte tilstander: satt opp → gjennomgått → møtt med bevis | README |
| Funn viser aldri den hemmelige verdien | spec 009 SC-003 |
| Byggesteg låst til commit-SHA | spec 009 FR-003 |
| Signaler for personopplysninger, og sjekklisten: formål, grunnlag, minimering, lagringstid, databehandlere, rettigheter, logging | spec 011 FR-002, FR-003 |
| Hver blokkerende hook har en tilsvarende sjekk i CI | spec 004 FR-007 |
| Omgåelse kan ikke hindres, bare synes | spec 004 FR-010 |
| Dataklasser: `public`, `internal`, `personal`, `restricted` | ROUTING.md |
| Én eier per dokument. Ingen andre oppgaveliste | ADR 0001 |
| Ærlige grenser skrevet inn i dokumentasjonen | SECURITY-MODEL |
| Factory: tavle bak en hjelper, roller med fast modell, to retterunder, stopp ved menneskets port | `vendor/factory` (del 7.10) |
| Lokale sjekker før CI, stifiltre, avbryt eldre kjøringer | spec 007 |
| Grennavn, Conventional Commits, PR-mal med bevis, tilskrivingsregel, «aldri sammenslåing uten beskjed» | spec 008 |
| Vakten: ikke ferdig uten bevis | VERIFICATION, nå i fase Sjekk (del 7.3) |

**Lar ligge:** CLI-en, valg av spec-rammeverk, pikselsammenligning av skjermbilder, Lean Kit, pakkemekanismen, hash-kjedene, Codex-kjøreren, parallelle arbeidstrær (til fase 7) og kopiene per prosjekt.

**Én ting snur vi:** spec 008 sa at Project Init aldri endrer grenbeskyttelse selv. Nå gjør oppsettskommandoen det, men bare etter forhåndsvisning og din godkjenning.

**Lisens:** project-init er Apache-2.0 med deg som rettighetshaver. `vendor/` er ifølge `NOTICE.md` levert av deg selv. OpenSpec, Spec Kit, BMAD og ECC er ikke med i repoet. Vi tar derfor ingen tredjepartskode. Kopieres tekst likevel senere, beholdes Apache-2.0 og én linje i `NOTICE`.

### 8.3 Global `CLAUDE.md`

Krympes til pekere, omtrent 12 linjer:

- **Behold:** «Spec først», «rapporter faktiske testresultater», kontekstgrensen på 400 000 og startmodell Opus.
- **Linjen «Project Init has been retired» byttes ut med:** «Project Init v3 er en Claude Code-plugin (`forge`). Den ruter skills, krav, modell, faser og GitHub-flyt automatisk. Følg teksten merket `[forge]`. Mapper som heter `.project-init/` og skills som heter `project-init-*` i eldre repoer er fra v2. Ignorer dem.»
- **Factory-regelen byttes ut med:** «Har repoet `project/board.json`, hører alt arbeid til et steg på tavla. Bare tavlehjelperen skriver den. Si aldri at en port er passert uten at den står som godkjent.» **Merk:** eldre prosjekter kan ha den gamle `factory/board.json`. Den er v2-format og ignoreres til prosjektet får sin baseline.
- **Modellruting og UI-avsnittet byttes ut med** pekeren over. De ikke-forhandlbare UI-kravene (WCAG 2.2 AA og resten) blir stående, fordi de er regler og ikke ruting.

### 8.4 `settings.json`

- **Behold impeccable-hookene der de er.** De eies av impeccable. Flytter vi dem, kan en oppdatering av impeccable legge dem tilbake, og du får dobbel kjøring. De kjører parallelt med forge uten konflikt.
- Legg til `"forge@local-tools": true` under `enabledPlugins` (skjer ved installasjon).
- **Tillatelser endres ikke av pluginen.** Hooks kan nekte, men de gir aldri agenten flere rettigheter.
- `pluginConfigs` for `ecc@ecc` kan fjernes. ECC er ikke slått på.
- Det løse feltet `description` nederst hører til impeccable-hookene og kan stå.

### 8.5 Repoet: nytt repo `Thugney/forge`, project-init arkiveres

Besluttet 18.11.2026: pluginen får eget repo. Ingenting av dette er gjort ennå.

1. **Nytt repo `Thugney/forge`.** Synlighet avgjøres av eieren før det lages. Anbefaling: offentlig, fordi gratisplanen da gir regelsett og push-vern mot hemmeligheter, og pluginen inneholder ingen hemmeligheter. Krav før første push: dette dokumentet renses for detaljer fra private prosjekter (eksemplene bruker et syntetisk eksempelprosjekt, og lokale stier er fjernet).
2. **Første commit:** plugin-skallet fra del 2.2, `LICENSE` (Apache-2.0 som før), README, `SECURITY.md`, `CONTRIBUTING.md`, `.gitignore`, `.gitattributes`, CHANGELOG og denne specen. Etter det går alt via gren og pull request. Repoet følger sine egne regler fra del 6A.
3. **CI for repoet:** `node --test`, gyldige manifester, og sjekk at alle `uses:` er låst til SHA.
4. **`Thugney/project-init`:** merket `v2-final` på dagens `main` (`08cc977`) pushes, README får øverst «Erstattet av forge: https://github.com/Thugney/forge. v2 ligger på merket `v2-final`.», og repoet arkiveres (skrivebeskyttet, kan angres). Ingen historikk slettes. Ideer hentes, filer kopieres ikke (del 8.2).
5. **Rydd lokalt (fase 6):** `npm uninstall --global project-init` hvis v2-CLI-en er installert.

### 8.6 Gamle kopier i prosjektene

Gamle prosjekter kan ha kopierte v2-skills, og noen har `.project-init/`. Rydd ved innmelding.

**Anbefaling: la dem ligge nå, rydd per prosjekt når du uansett åpner det.** En kopiert skill med samme navn som en global kan gi to treff, men den skader ikke. Massesletting på tvers av mange mapper med ukjent, ikke-committet arbeid er mer risiko enn gevinst. Når et prosjekt får sin baseline, lister gap-rapporten de gamle kopiene, og du godkjenner sletting der og da.

### 8.7 Eksisterende prosjekter over på PR-flyt

**Konflikten:** et eksisterende prosjekt kan ha agentregler (for eksempel i `AGENTS.md`) som sier «commit og push til `main`». Det er motsatt av regelen i del 6A. Pluginen endrer aldri slike filer uten at du sier ja.

**Forslag, i denne rekkefølgen, ett prosjekt om gangen:**

1. Baseline setter `github.flow: "trunk"`. Da nekter ikke hooken push til `main`, og ingenting stopper opp. CM-02 står som gap i rapporten.
2. Legg inn `ci.yml` og `security.yml`. Få dem grønne på `main` først. Krever du en sjekk som ikke finnes eller ikke er grønn, låser du repoet.
3. Kjør `/forge:github-setup`. Les forhåndsvisningen. Godkjenn.
4. Endre avslutningsregelen i `AGENTS.md` til: «Avslutt ryddig. Egen gren og pull request. Eieren godkjenner sammenslåing.»
5. Sett `github.flow: "pr"`. Fra nå nekter hooken push til `main`.

Tvangspush, `--no-verify`, `git commit -a` og hemmeligheter nektes fra første dag, også på `trunk`. Regelen om eksplisitte stier har du alt.

---

## 9. Byggeplan

Tester kjøres med `node --test`. Testene lager midlertidige git-repoer i systemets temp-mappe. Falske hemmeligheter settes sammen i testen, slik at ingen nøkkel-lignende streng ligger i repoet. Kall mot GitHub testes mot innspilte svar, ikke mot nettet.

| Fase | Innhold | Modell | Ferdig når |
| --- | --- | --- | --- |
| **0 · Repo og prøve** (kort) | Merke `v2-final`, gren `v3-plugin`, treet byttes ut (del 8.5). Tomt plugin-skall, markedsplass, én hook per hendelse som bare logger inndata | Opus, hovedøkt | `claude plugin validate` består. Loggen viser at hooks fyrer på Windows i Git Bash og PowerShell. `additionalContext` synes i økten. En prøveblokk i `Stop` og et prøveavslag i `PreToolUse` virker for både Bash- og PowerShell-verktøyet. Avklart: matcher `Skill`, og om egne skråstrekkommandoer når `UserPromptSubmit`. Tidsbruk målt |
| **1 · Nyttig alene** | `prompt-router`, `session-start` (bare oppdagelse), `compliance-guard` (modus `gate` og enkel `baseline`), hele katalogen, `model-router` og agentene flyttet inn | Skript og tester: builder (Sonnet). Katalog og skills: Opus. Kobling mot kildetekster: Opus-gjennomgang, så du | Ordlistetest: minst 60 meldinger på norsk og engelsk, alle «må treffe» treffer, ingen treff på 15 nøytrale. p95 under 300 ms målt over 20 kjøringer. Ødelagt JSON på stdin gir kode 0. Katalogtest: unike ID-er, gyldige felt, hver kontroll har minst én sjekk. Navnetest (del 2.3). Du ser `[forge]`-teksten i en ekte økt |
| **2 · Faseløkka** | `board.mjs`, skillen `flow` med sju fasefiler, `STATUS.md`, kommandoene `plan`, `next`, `status`, `approve`, `feedback`, godkjenningsmerket, gjenopptakelse i `session-start`, agenten `reviewer` | builder (hjelper og tester), Opus (fasetekstene, i klarspråk) | Tester: hvert ugyldig flytt i del 7.3 nektes. Godkjenning uten merke nektes. `STATUS.md` stemmer med tavla. Ett ekte lite steg kjørt gjennom alle sju faser i et prøveprosjekt, der du forstår hver melding uten å spørre |
| **3 · Profil og gap-rapport** | `init`, full `baseline`, malene, `project-start`, `/forge:enroll` | Opus (skills), builder (maler, `catalog-query`) | `init` i tom testmappe gir gyldig profil. Baseline kjørt mot et syntetisk testrepo med RLS-migrasjoner gir en rapport du kjenner deg igjen i, uten endring i kildekode |
| **4 · Vakter** | `stop-guard` (to blokkeringer og advarslene), `git-guard` (lag B), unntak, øktminne, `skill-seen` | builder per sjekk. Opus gjennomgår mønstre og falske alarmer | Testrepoer: hemmelighet → blokk uten at verdien vises. Tabell uten RLS → blokk. Med RLS → stille. Unntak → stille. Samme funn tredje gang → advarsel. Hver rad i tabellen i 6A.3 har en test for «nekter» og en for «slipper gjennom». Kjørt mot et syntetisk testrepo med RLS-migrasjoner uten falske blokker |
| **5 · GitHub og CI** | `github-flow`, repo-maler, `ci.yml` og `security.yml` med `gate`, `github-setup` med forhåndsvisning, modus `evidence`, AGENTS-utdrag | builder (maler, oppsettsskript), Opus (gjennomgang) | Alle `uses:` er 40 tegn SHA (test). Oppsett kjørt mot ett offentlig og ett privat prøverepo: forhåndsvisningen viser riktig hva som er tilgjengelig, og ingenting endres uten godkjenning. En PR med bare dokumentasjon kjører én jobb og kan slås sammen. En direkte push til `main` avvises av GitHub |
| **6 · Opprydding** | Global `CLAUDE.md`, `settings.json`, slette gamle kopier av `model-router` og agentene, avinstallere v2-CLI-en, `v3-plugin` slås sammen til `main` | Opus, med deg | Ny økt i tre ulike prosjekter oppfører seg riktig. Ingen doble skills eller agenter. `git checkout v2-final` gir fortsatt hele v2 |
| **7 · Senere** | Flere agenter i egne arbeidstrær, integrasjonstre, Codex som arbeider. Normen og UAE PDPL | Fable (`architect`) for ny spec | Egen spec og egen godkjenning |

Hver fase er sin egen spec og sin egen godkjenning, og går selv gjennom faseløkka så snart fase 2 finnes. Fase 1 kan brukes daglig selv om resten aldri bygges.

**Risikoer**

| Risiko | Tiltak |
| --- | --- |
| Ruteren bommer eller maser | Kort tekst, test mot ordliste, lett å justere `keywords.json` |
| Falske blokker gjør deg lei | Bare tillagte linjer, unntaksfil, høyst to blokker per funn, `strictness: warn` |
| Faseløkka blir like tung som v2 | Hurtigspor for småfeil. Tavla sjekker at bevis finnes, ikke hash-kjeder. Ett aktivt steg om gangen i v1 |
| Hook-formatet endres i Claude Code | Fase 0-testene kjøres på nytt ved oppdatering. Alt feiler åpent |
| Koblingene til rammeverk er feil | Merket `draft`. Gjennomgang før «ferdig». Aldri brukt som juridisk påstand |
| Modellen overser rutingteksten | Stoppvakten og tavlehjelperen sjekker resultatet. CI og GitHub sjekker igjen |
| GitHub-innstillinger finnes ikke på planen din | Oppsettet prøver og viser. Lag B og CI tar over. Gap-rapporten sier `partial` |
| Påkrevd sjekk henger på grunn av stifilter | Én `gate`-jobb som alltid kjører |

---

## 10. Spørsmål og svar

Besvart av eieren 18.11.2026. Se del 0.

1. **Navn:** `forge`, eget repo.
2. **Andre prosjekter:** bare innmeldte (`/forge:enroll`).
3. **GitHub:** gratisplan, ingen Pro. PR-flyt innføres ett prosjekt om gangen ved innmelding (del 8.7).
4. **Strenghet:** blokker. Ingen kode før planen er godkjent. Vakten før utrulling er med.
5. **Rammeverk etter v1:** velges per prosjekt i Krav, ut fra hva vi bygger.

**Gjenstår:** synlighet for `Thugney/forge` (offentlig anbefales, se del 8.5) og hvem som kontrollerer koblingene mot ISO-teksten, som koster penger å lese. Inntil det er gjort, er koblingene merket `draft`.
