# Modus gate: krav før spec

Kjøres før det skrives spec, plan eller kode for en funksjon. Målet er 5–10 linjer med konkrete krav i specen, og at eieren ser risikoene før omfanget godkjennes.

## Steg

1. **Finn merkene.** Les forespørselen og bruk merkene fra ruteren (`[…] Treff: …`) hvis de finnes. Legg til merker du selv ser, for eksempel `db-schema` når funksjonen trenger en ny tabell. Heller ett merke for mye enn ett for lite.
2. **Finn rammeverkene.** Les `frameworks` i `compliance/profile.json` og ta med de som er `true`. Uten profil: `gdpr,iso27001,soc2`, og si at profilen mangler.
3. **Hent kontrollene.**

   ```sh
   node "${CLAUDE_PLUGIN_ROOT}/scripts/catalog-query.mjs" --tags <merker> --frameworks <rammeverk>
   ```

4. **Sorter bort det som ikke gjelder.** Kontroller med `periodic` eller bare `owner`-sjekk tas ikke med i specen, med mindre funksjonen endrer dem (for eksempel ny leverandør → VN-01, VN-02). Står kontrollen i `notApplicable` i profilen, hopp over den.
5. **Skriv «Krav fra kontrollene»** inn i specen eller oppgaven. Én linje per kontroll: ID, hva denne funksjonen konkret må gjøre, og hvilket bevis som skal finnes når den er ferdig. Bruk `askInSpec` som spørsmål du svarer på eller stiller eieren.
6. **Flagg risikoer** (se under) i et eget avsnitt.
7. **Stopp.** Vis kravene og risikoene til eieren og be om godkjenning av omfanget. Ingen kode før eieren har sagt ja.

## Mal

```markdown
### Krav fra kontrollene
Rammeverk: GDPR, ISO 27001, SOC 2 (koblinger: utkast). Merker: personal-data, db-schema.

- AC-03: tabellen `customer_note` får RLS og regel i samme migrasjon. Bevis: RLS-testen består.
- DP-05: notater slettes 365 dager etter siste time. Bevis: slettejobb og test.
- DP-06: notatteksten logges aldri, bare notatets ID. Bevis: liste over loggkall.
- PR-05: notatet slettes når kunden slettes. Bevis: slettetesten dekker tabellen.
- DP-01: datakartet får feltet `note` under behandlingen `booking`.

### Risiko og avklaringer
- Fritekst kan inneholde helseopplysninger → vurder DPIA (PR-06). Eieren avgjør.
```

## Flagg alltid når

| Funn | Kontroller | Hva du sier |
| --- | --- | --- |
| Ny type personopplysning eller nytt felt | DP-01, DP-04, DP-05 | Datakartet må oppdateres i samme steg |
| Helse, barn, overvåking, profilering, AI på personopplysninger | PR-06, AI-02 | Trolig DPIA. Eieren avgjør |
| Ny leverandør, SDK, skript eller API | VN-04, VN-01, VN-02 | Vurdering og avtale før ekte data sendes |
| Data ut av EØS | VN-03 | Grunnlaget må stå skrevet. «Å avklare» til det gjør det |
| Ny tabell med kundedata | AC-03, AC-04 | RLS i samme migrasjon |
| Personopplysninger til en språkmodell | AI-01, AI-02, AI-05 | Hvilke felt, hvorfor, og leverandørens vilkår |
| Ny nøkkel eller hemmelighet | SDL-02, AC-06 | Hvor den lagres og hvem som roterer |

## Regler

- Skriv konkret for denne funksjonen. Kopier ikke `requirement`-teksten fra katalogen.
- Lov aldri at noe er møtt. Gate skriver krav, ikke status.
- Er en kontroll uklar for funksjonen, skriv «Å avklare» og spørsmålet.
- Bruk ærlighetsregelen i `SKILL.md`.
