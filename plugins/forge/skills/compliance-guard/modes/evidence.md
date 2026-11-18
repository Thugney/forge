# Modus evidence: bevis per funksjon

Kort versjon. Hele flyten (oppdatering av status, datakart og leverandørliste) kommer i en senere fase.

Når en funksjon er bygget og testet, skriv `compliance/evidence/<ÅÅÅÅ-MM-DD>-<navn>.md`:

```markdown
# 2026-11-20 · kunde-sletting
<!-- evidence {"feature":"kunde-sletting","task":"docs/TASKS.md#PR-12",
     "controls":["PR-05","DP-05","LG-01"],"commit":"abc1234"} -->

| Kontroll | Hva ble gjort | Kommando | Resultat | Kilde |
| --- | --- | --- | --- | --- |
| PR-05 | Sletting av én kunde i alle tabeller | `npm test -- rights` | 14 bestått, 0 feilet | local-run |
| LG-01 | Slettingen står i revisjonsloggen | `npm test -- audit` | 6 bestått | local-run |

**Ikke prøvd:** sletting hos SMS-leverandøren. Krever ekte konto. Står i eierens sjekkliste.
```

## Regler

- Kontrollene er de samme som i «Krav fra kontrollene» i specen.
- `Resultat` er det kommandoen faktisk skrev ut. Feilet noe, skriv det som det er.
- `Kilde` er én av `ci`, `local-run`, `code-read`, `owner-attested`. Et resultat fra simulator eller testadapter er `local-run`, aldri bevis for ekte leverandør eller ekte telefon.
- Seksjonen «Ikke prøvd» er påkrevd. Er den tom, skriv «Ingenting».
- Bruk ærlighetsregelen i `SKILL.md`. Bevisfila viser hva som er gjort, ikke at prosjektet er godkjent.
