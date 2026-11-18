# Modus baseline: gap-rapport for et eksisterende repo

Enkel versjon (fase 1). Kartlegger det som finnes og skriver en gap-rapport. **Endrer ikke kildekode.** Ingen implementering før eieren har lest rapporten.

## Steg

1. **Si hva som skjer.** Fortell eieren at du nå leser repoet, ikke endrer det, og at resultatet er en rapport med forslag.
2. **Kartlegg med explorer.** Start `<plugin>:explorer` med `model: haiku`. Be om korte funn med filsti og linjenummer for:
   - databasemigrasjoner, RLS, roller i databasen
   - innlogging, tokenkontroll, roller og medlemskap
   - logging, revisjonslogg, overvåking
   - leverandører, SDK-er, eksterne domener, AI-bruk
   - personvern- og sikkerhetsdokumenter (protokoll, DPIA, erklæring, hendelsesrutine, SECURITY.md)
   - CI, avhengighetsskanning, låsefiler, `.gitignore` for `.env*`
   - sikkerhetskopi, utrulling, miljøer, testdata
   - repo-filer: README, CODEOWNERS, CHANGELOG, maler
3. **Hent alle kontrollene** for standardrammeverkene (legg til `hipaa` bare hvis repoet tydelig behandler amerikanske helseopplysninger, og spør eieren):

   ```sh
   node "${CLAUDE_PLUGIN_ROOT}/scripts/catalog-query.mjs" --tags ui,feature,personal-data,db-schema,api,auth,logging,third-party,ai,deps,infra,periodic --frameworks gdpr,iso27001,soc2
   ```

4. **Vurder hver kontroll selv** (Opus, hovedøkten) ut fra funnene. Les selv de filene som avgjør vurderingen. Gjett ikke ut fra filnavn alene.
5. **Skriv rapporten** til `compliance/GAP-REPORT.md` (se mal). Det er den eneste fila du skriver før eieren har svart.
6. **Stopp.** Vis et kort sammendrag: antall per status, de 3–5 viktigste gapene, og hva som må avklares med eieren. Be eieren lese rapporten.
7. **Etter eierens OK:** lag `compliance/profile.json` etter del 6.1 i designdokumentet, og `compliance/controls.json` med status per kontroll. Gapene eieren velger, blir oppgaver i prosjektets oppgaveliste. Ingenting implementeres i denne modusen.

## Status

| Status | Betyr |
| --- | --- |
| Trolig møtt | Koden eller dokumentet viser det. Kilde `code-read`, ikke bevist med test |
| Delvis | Noe finnes, men ikke alt (for eksempel skanning lokalt, men ikke i CI) |
| Mangler | Ikke funnet i repoet |
| Å avklare | Kan finnes utenfor repoet, eller krever eierens svar (avtaler, rutiner, opplæring) |
| Ikke relevant | Gjelder ikke prosjektet. Skriv hvorfor |

Organisatoriske kontroller er som regel «Å avklare» til eieren har svart. Skriv aldri «Mangler» om noe som kan ligge hos eieren.

## Mal for `compliance/GAP-REPORT.md`

```markdown
# Gap-rapport · <prosjekt> · <dato>
Commit: <kort SHA>. Rammeverk: GDPR, ISO 27001, SOC 2. Koblinger: utkast.
Kilde for alle vurderinger: code-read. Ingen tester er kjørt i denne rapporten.

## Sammendrag
Trolig møtt: 14 · Delvis: 6 · Mangler: 9 · Å avklare: 15 · Ikke relevant: 4

## Kontroller
| ID | Tittel | Status | Grunnlag (fil:linje eller dokument) | Neste steg |
| --- | --- | --- | --- | --- |
| AC-03 | Kundeskille i datalaget | Trolig møtt | db/migrations/0004_rls.sql, test/rls.test.ts | Kjør RLS-testen og legg resultatet i bevisloggen |
| SDL-04 | Forsyningskjede | Mangler | Ingen .github/workflows | Oppgave: CI med avhengighetsskanning |
| VN-02 | Databehandleravtale | Å avklare | docs/privacy/SUBPROCESSORS.md nevner to leverandører uten avtale | Eieren bekrefter avtalene |

## Dokumenter som alt finnes (pek, ikke kopier)
| Hva | Fil |
| --- | --- |
| Protokoll | docs/privacy/ROPA.md |

## Spørsmål til eieren
1. …
```

## Regler

- **Pek, ikke kopier.** Finnes et dokument, skriv stien i rapporten og senere i `artefacts` i profilen.
- Endre ingen kildefiler, migrasjoner, CI-filer eller dokumenter utenfor `compliance/`.
- Lag ikke `profile.json` før eieren har sagt OK.
- Bruk ærlighetsregelen i `SKILL.md`. Rapporten er en kartlegging, ikke en revisjon.
