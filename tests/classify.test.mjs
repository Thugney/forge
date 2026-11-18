import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { scriptsDir } from './helpers.mjs';

const { classify } = await import(pathToFileURL(path.join(scriptsDir, 'lib', 'classify.mjs')).href);

// [melding, merker som MÅ treffe]
const MUST_HIT = [
  ['legg til et skjema der kunden kan endre telefonnummeret sitt', ['ui', 'feature', 'personal-data']],
  ['lag en ny knapp på forsiden', ['ui']],
  ['endre layout på mobil', ['ui']],
  ['bygg en ny komponent for kalenderen', ['ui', 'feature']],
  ['vi trenger en portal for eierne', ['ui']],
  ['fiks designet på nettsiden', ['ui']],
  ['add a button to the page', ['ui', 'feature']],
  ['the form needs better validation styling', ['ui']],
  ['restyle the dashboard with tailwind', ['ui']],
  ['make the layout responsive on phones', ['ui']],
  ['implementer en ny funksjon for avbestilling', ['feature']],
  ['we need a new feature for recurring bookings', ['feature']],
  ['implement a waitlist', ['feature']],
  ['opprett en venteliste for fulle dager', ['feature']],
  ['lagre kundens e-post i databasen', ['personal-data', 'db-schema']],
  ['vis pasientens navn i listen', ['personal-data']],
  ['hent adressen til brukeren', ['personal-data']],
  ['validate the customer email address', ['personal-data']],
  ['store the patient phone number', ['personal-data']],
  ['vi må håndtere personnummer riktig', ['personal-data']],
  ['legg til fødselsdato på profilen', ['personal-data', 'feature']],
  ['export all user data for a gdpr request', ['personal-data']],
  ['lag en migrasjon som legger til en kolonne', ['db-schema', 'feature']],
  ['ny tabell for timer', ['db-schema', 'feature']],
  ['write a migration for the orders table', ['db-schema']],
  ['add a column to the bookings table', ['db-schema', 'feature']],
  ['sett opp row level security i postgres', ['db-schema']],
  ['lag et nytt endepunkt for bestillinger', ['api', 'feature']],
  ['add an endpoint that returns open slots', ['api', 'feature']],
  ['oppdater openapi-kontrakten', ['api']],
  ['design the REST api for appointments', ['api']],
  ['bygg en graphql-tjeneste', ['api']],
  ['innlogging med e-post og passord', ['auth', 'personal-data']],
  ['legg inn roller for admin og ansatt', ['auth']],
  ['the login session expires too early', ['auth']],
  ['rotate the jwt signing key', ['auth']],
  ['add oauth sign in with a provider', ['auth', 'feature']],
  ['krev tofaktor for admin', ['auth']],
  ['sjekk tilgang før vi viser rapporten', ['auth']],
  ['logg alle feil til en fil', ['logging']],
  ['add audit logging for admin actions', ['logging']],
  ['send errors to sentry', ['logging']],
  ['skru på telemetri i produksjon', ['logging', 'infra']],
  ['integrer med en ny sms-leverandør', ['third-party']],
  ['legg til stripe for betaling', ['third-party', 'feature']],
  ['connect to the vendor webhook', ['third-party', 'api']],
  ['bruk twilio sdk for å sende varsler', ['third-party']],
  ['legg inn analytics på nettsiden', ['third-party', 'ui']],
  ['bytt modell til en raskere llm', ['ai']],
  ['skriv en ny prompt for agenten', ['ai']],
  ['transkripsjon av samtaler med claude', ['ai']],
  ['add an embedding search over the faq', ['ai']],
  ['the chatbot hallucinates prices', ['ai']],
  ['oppgrader avhengighetene i prosjektet', ['deps']],
  ['npm install a date library', ['deps']],
  ['bump the dependencies and check the lockfile', ['deps']],
  ['legg til pakken zod', ['deps', 'feature']],
  ['deploy til produksjon i kveld', ['infra']],
  ['set up a docker compose file', ['infra']],
  ['lag en ci pipeline med github actions', ['infra']],
  ['rull ut til serveren', ['infra']],
  ['configure the dns and tls certificate', ['infra']],
  ['ta backup av databasen før utrullingen', ['infra', 'db-schema']],
  ['hvor ligger hemmelighetene i miljøet', ['infra']],
  ['bytt passord på databasen og rull ut', ['auth', 'db-schema', 'infra']],
  ['Lag et SKJEMA for påmelding', ['ui', 'feature']],
  ['sett opp søknadsskjema for ansatte på mobil', ['ui', 'personal-data']],
];

const NEUTRAL = [
  'ja',
  'fortsett',
  'takk',
  'hva er klokka',
  'kan du oppsummere samtalen så langt',
  'what does this error mean',
  'explain the difference between let and const',
  'hvorfor feiler testen',
  'run the tests',
  'kjør testene på nytt',
  'show me the git history',
  'les filen og fortell meg hva den sier',
  'that looks good to me',
  'ok, det virker bra',
  'can you explain that again in simpler words',
];

test('word list has at least 60 must-hit prompts and 15 neutral ones', () => {
  assert.ok(MUST_HIT.length >= 60, `must-hit: ${MUST_HIT.length}`);
  assert.ok(NEUTRAL.length >= 15);
});

test('every must-hit prompt hits all its expected tags', () => {
  const misses = [];
  for (const [prompt, expected] of MUST_HIT) {
    const got = classify(prompt);
    const missing = expected.filter((t) => !got.includes(t));
    if (missing.length) misses.push(`${prompt} -> mangler ${missing.join(',')} (fikk ${got.join(',') || 'ingen'})`);
  }
  assert.deepEqual(misses, []);
});

test('neutral prompts produce no tags', () => {
  const noisy = NEUTRAL.map((p) => [p, classify(p)]).filter(([, t]) => t.length);
  assert.deepEqual(noisy, []);
});

test('classify handles æøå, case and bad input', () => {
  assert.ok(classify('FØDSELSDATO').includes('personal-data'));
  assert.ok(classify('Overvåk loggene').includes('logging'));
  assert.deepEqual(classify(''), []);
  assert.deepEqual(classify(undefined), []);
  assert.deepEqual(classify(42), []);
});
