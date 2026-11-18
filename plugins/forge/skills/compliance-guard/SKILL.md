---
name: compliance-guard
description: Krav til sikkerhet og personvern (GDPR, ISO 27001, SOC 2, og HIPAA når det er slått på) bygget inn i arbeidet. Bruk før du skriver spec eller kode for en funksjon (modus gate), når et eksisterende repo mangler compliance/profile.json (modus baseline), når et nytt prosjekt settes opp (modus init), og etter bygging for å skrive bevis (modus evidence).
---

# compliance-guard

## 1. Ærlighetsregelen (gjelder alltid)

- Si **«bygget for å møte kravene»**, **«bygget etter kravene»** eller **«klart for revisjon»** (audit-ready).
- Si aldri **«sertifisert»**, **«compliant»** eller **«oppfyller GDPR»** som en juridisk påstand. Bare en revisor eller myndighet kan si det.
- Dette er ikke juridisk rådgivning. Er noe juridisk uklart, skriv «Å avklare» og si hvem som bør vurdere det.
- Koblingene til paragrafer og punkter i katalogen er merket `draft`. Si det når du siterer dem.
- Merk hvert bevis med kilde: `ci`, `local-run`, `code-read` eller `owner-attested`. Å ha lest koden (`code-read`) er ikke det samme som en test som har kjørt. Skriv aldri at noe har bestått uten kommando og faktisk resultat.
- Bruk bare syntetiske data i eksempler, tester og rapporter.

## 2. Når du bruker skillen

- Meldingen eller ruteren nevner merker som `personal-data`, `db-schema`, `auth`, `api`, `logging`, `third-party`, `ai`, `deps` eller `infra`.
- Du skal skrive spec, plan eller oppgave for en ny funksjon.
- Repoet er meldt inn, men har ikke `compliance/profile.json`.
- En funksjon er bygget og skal merkes ferdig.

## 3. Velg modus

| Situasjon | Modus | Les |
| --- | --- | --- |
| Ny funksjon, før spec eller kode | `gate` | `modes/gate.md` |
| Eksisterende repo uten `compliance/profile.json` | `baseline` | `modes/baseline.md` |
| Nytt, tomt repo eller nytt prosjekt fra en plan | `init` | `modes/init.md` |
| Funksjonen er bygget og testet | `evidence` | `modes/evidence.md` |

Les bare fila for modusen du bruker. Er du i tvil mellom `baseline` og `init`: finnes det kildekode, er det `baseline`.

Mangler profilen og du står i `gate`: kjør gate med standardrammeverkene (gdpr, iso27001, soc2), og si at profilen mangler og at baseline eller init bør kjøres.

## 4. Katalogen

Les aldri hele katalogen. Hent bare kontrollene som gjelder:

```sh
node "${CLAUDE_PLUGIN_ROOT}/scripts/catalog-query.mjs" --tags personal-data,db-schema --frameworks gdpr,iso27001,soc2
```

- Merkene er: `ui`, `feature`, `personal-data`, `db-schema`, `api`, `auth`, `logging`, `third-party`, `ai`, `deps`, `infra`. I tillegg `periodic` for årlige eierkontroller.
- Rammeverkene leser du fra `frameworks` i `compliance/profile.json`. Uten profil: `gdpr,iso27001,soc2`. HIPAA bare når profilen sier `"hipaa": true`.
- Svaret er JSON med `id`, `title`, `requirement`, `checks`, `evidence` og `askInSpec`. Gir skriptet `[]` uten at du venter det, si det. Søk da opp de konkrete ID-ene i `${CLAUDE_PLUGIN_ROOT}/catalog/controls.json` med Grep.

## 5. Statusverdier

| I rapporten | I `compliance/controls.json` |
| --- | --- |
| Trolig møtt | `met` |
| Delvis | `partial` |
| Mangler | `gap` |
| Å avklare | `unknown` |
| Ikke relevant | `n/a` (med begrunnelse i `notApplicable` i profilen) |

`unknown` er ærlig og tillatt. Hold tre ting fra hverandre: profilen finnes → gjennomgangen er gjort → kontrollen er møtt med bevis. Det ene betyr ikke det neste.

## 6. Pek, ikke kopier

Finnes et dokument alt (personvernerklæring, protokoll, hendelsesrutine), pek på det fra `artefacts` i profilen. Lag ikke en parallell kopi.

## 7. Agenter

- Kartlegging av mange filer: `<plugin>:explorer` (Haiku). `<plugin>` er navnet i pluginens `plugin.json`.
- Vurderingen mot kontrollene gjør du selv i hovedøkten (Opus).
- Følg skillen `model-router` for modellvalg, og oppgi modellen når du starter en subagent.
