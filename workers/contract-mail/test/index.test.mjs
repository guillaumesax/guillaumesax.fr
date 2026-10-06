import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import worker from '../src/index.mjs';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const env = {
  ALLOWED_ORIGIN: 'https://guillaumesax.fr',
  MAIL_FROM: 'Guillaume Sax <contrats@guillaumesax.fr>',
  MAIL_TO: 'contact@guillaumesax.fr',
  TURNSTILE_SECRET: 'test-secret',
  RESEND_API_KEY: 'test-api-key',
};

function request(copyToClient = true, pdf = true) {
  const data = {
    clientName: 'Camille Exemple', clientAddress: '1 rue Exemple, 75000 Paris',
    clientEmail: 'camille@example.test', clientPhone: '0600000000',
    eventDate: '2027-06-12', venue: 'Domaine des Lilas',
    venueAddress: '2 avenue Exemple, 75000 Paris', prestation: 'Cocktail',
    startTime: '18:00', endTime: '20:00', quoteNumber: 'DEV-TEST',
    signedCity: 'Paris', total: '1000', deposit: '300',
    imagePermission: false, copyToClient, signedAt: new Date().toISOString(),
    version: 'Édition 2026-10', options: '', specialTerms: '',
  };
  const form = new FormData();
  form.set('contract', JSON.stringify(data));
  const bytes = new Uint8Array(1200);
  bytes.set(new TextEncoder().encode(pdf ? '%PDF-' : 'wrong'));
  form.set('document', new File([bytes], 'contrat.pdf', { type: 'application/pdf' }));
  form.set('turnstile', 'test-token');
  form.set('submissionId', '00000000-0000-4000-8000-000000000001');
  return new Request('https://worker.example.test/', {
    method: 'POST', headers: { Origin: env.ALLOWED_ORIGIN }, body: form,
  });
}

test('sends one PDF email with an optional client copy', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.includes('siteverify')) return Response.json({ success: true, hostname: 'guillaumesax.fr' });
    return Response.json({ id: 'email-test-id' });
  };
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  const message = JSON.parse(calls[1].options.body);
  assert.deepEqual(message.to, ['contact@guillaumesax.fr']);
  assert.deepEqual(message.cc, ['camille@example.test']);
  assert.equal(message.attachments[0].filename, 'contrat-guillaume-sax-2027-06-12.pdf');
  assert.ok(atob(message.attachments[0].content).startsWith('%PDF-'));
  assert.equal(calls[1].options.headers['Idempotency-Key'], '00000000-0000-4000-8000-000000000001');
});

test('omits the client copy when it is not selected', async () => {
  let message;
  globalThis.fetch = async (url, options) => {
    if (url.includes('siteverify')) return Response.json({ success: true, hostname: 'guillaumesax.fr' });
    message = JSON.parse(options.body);
    return Response.json({ id: 'email-test-id' });
  };
  assert.equal((await worker.fetch(request(false), env)).status, 200);
  assert.equal(message.cc, undefined);
});

test('rejects invalid PDF and invalid Turnstile without sending', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ success: false }); };
  assert.equal((await worker.fetch(request(true, false), env)).status, 400);
  assert.equal(calls, 0);
  assert.equal((await worker.fetch(request(), env)).status, 403);
  assert.equal(calls, 1);
});

test('rejects other origins and reports mail provider failure', async () => {
  const foreign = request();
  foreign.headers.set('Origin', 'https://other.example.test');
  assert.equal((await worker.fetch(foreign, env)).status, 403);
  globalThis.fetch = async url => url.includes('siteverify')
    ? Response.json({ success: true, hostname: 'guillaumesax.fr' })
    : Response.json({ error: 'denied' }, { status: 403 });
  assert.equal((await worker.fetch(request(), env)).status, 502);
});

test('answers browser preflight only for the public site', async () => {
  const preflight = new Request('https://worker.example.test/', {
    method: 'OPTIONS', headers: { Origin: env.ALLOWED_ORIGIN },
  });
  const response = await worker.fetch(preflight, env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), env.ALLOWED_ORIGIN);
});
