# Modus init: profil for et nytt prosjekt

Kjøres i fasen Krav for et nytt prosjekt, når planen finnes, men det ikke er skrevet kode. Lager profilen fra planen. Spør bare om det planen ikke svarer på.

## Steg

1. **Les planen** (prosjektets plan eller spec). Finn svar på de seks spørsmålene under.
2. **Spør eieren** bare om det som mangler. Ett samlet spørsmål, i klarspråk, med forslag til svar.
3. **Vis utkastet** til `compliance/profile.json` og be om OK.
4. **Etter OK:** skriv `compliance/profile.json` og `compliance/controls.json` der alle aktive kontroller har status `unknown`. Hent kontrollene slik:

   ```sh
   node "${CLAUDE_PLUGIN_ROOT}/scripts/catalog-query.mjs" --tags ui,feature,personal-data,db-schema,api,auth,logging,third-party,ai,deps,infra,periodic --frameworks <rammeverk fra profilen>
   ```

5. **Si hva som kommer:** første funksjon går gjennom modus `gate`. Fulle maler (datakart, risikoregister, CI) kommer i en senere fase. Lov ikke mer enn det som er laget.

## De seks spørsmålene

| Spørsmål | Felt i profilen | Eksempel på svar |
| --- | --- | --- |
| Hva slags data? | `dataClass` | `personal`, `special` (helse og lignende), `none` |
| Behandlingsansvarlig, databehandler eller begge? | `role` | `["processor", "controller"]` |
| Hvilke rammeverk? | `frameworks` | GDPR, ISO 27001 og SOC 2 på. HIPAA bare ved amerikanske helseopplysninger |
| Database, og trengs RLS? | `datastore` | `postgres`, `rls.required: true` når flere kunder deler tabeller |
| Brukes AI? | `ai` | `{ "used": true, "providers": ["ai-leverandor"] }` |
| Hvor ligger oppgavelisten og agentreglene? | `workflow` | `docs/TASKS.md`, `AGENTS.md` |

Rammeverk som kan bli aktuelle senere (for eksempel helse i Norge), står i `frameworkCandidates`. De slås ikke på uten eierens beslutning.

## Utkast (syntetisk eksempel)

```json
{
  "schema": 1,
  "catalogVersion": "0.1.0",
  "project": "eksempel-booking",
  "dataClass": "personal",
  "role": ["processor", "controller"],
  "frameworks": { "gdpr": true, "iso27001": true, "soc2": true, "hipaa": false },
  "frameworkCandidates": [],
  "datastore": { "engine": "postgres", "rls": { "required": true, "migrationGlobs": ["db/migrations/*.sql"], "exemptTables": [] } },
  "ai": { "used": false, "providers": [] },
  "workflow": { "taskList": "docs/TASKS.md", "agentRules": "AGENTS.md", "boardDir": "project" },
  "github": { "flow": "pr" },
  "artefacts": {},
  "notApplicable": {}
}
```

Nye prosjekter starter med `github.flow: "pr"`. `artefacts` er tom til dokumentene finnes. Pek på dem når de lages.

## Regler

- Skriv ingenting før eieren har sagt OK.
- Bruk ærlighetsregelen i `SKILL.md`. En profil betyr ikke at noen kontroll er møtt.
