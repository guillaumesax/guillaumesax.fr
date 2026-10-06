const maxPdfBytes = 8 * 1024 * 1024;
const maxRequestBytes = 12 * 1024 * 1024;
const expectedVersion = 'Édition 2026-10';

function respond(body, status, origin) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  });
}

function validText(value, maximum = 500) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum;
}

function validEmail(value) {
  return typeof value === 'string' && value.length <= 254 &&
    /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
}

function validContract(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const required = ['clientName', 'clientAddress', 'clientPhone', 'venue', 'venueAddress',
    'prestation', 'quoteNumber', 'signedCity'];
  if (!required.every(key => validText(data[key]))) return false;
  if (!validEmail(data.clientEmail) || data.version !== expectedVersion) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.eventDate) ||
      !/^\d{2}:\d{2}$/.test(data.startTime) || !/^\d{2}:\d{2}$/.test(data.endTime)) return false;
  if (typeof data.imagePermission !== 'boolean' || typeof data.copyToClient !== 'boolean') return false;
  if ((data.options && !validText(data.options, 2000)) ||
      (data.specialTerms && !validText(data.specialTerms, 3000))) return false;
  const total = Number(data.total);
  const deposit = Number(data.deposit);
  if (!Number.isFinite(total) || total <= 0 || total > 1_000_000 ||
      !Number.isFinite(deposit) || deposit !== Math.round(total * 30) / 100) return false;
  const signedAt = Date.parse(data.signedAt);
  if (!Number.isFinite(signedAt) || Math.abs(Date.now() - signedAt) > 24 * 60 * 60 * 1000) return false;
  return true;
}

function base64(bytes) {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    if (origin !== env.ALLOWED_ORIGIN) return new Response('Forbidden', { status: 403 });
    if (request.method === 'OPTIONS') return respond({}, 204, origin);
    if (request.method !== 'POST') return respond({ error: 'Méthode non autorisée.' }, 405, origin);
    if (!env.TURNSTILE_SECRET || !env.RESEND_API_KEY || !env.MAIL_FROM || !env.MAIL_TO)
      return respond({ error: 'Service indisponible.' }, 503, origin);
    if (Number(request.headers.get('Content-Length') || 0) > maxRequestBytes)
      return respond({ error: 'Le PDF est trop volumineux.' }, 413, origin);

    let form;
    try { form = await request.formData(); }
    catch { return respond({ error: 'Formulaire invalide.' }, 400, origin); }

    let contract;
    try { contract = JSON.parse(String(form.get('contract') || '')); }
    catch { return respond({ error: 'Contrat invalide.' }, 400, origin); }
    const document = form.get('document');
    const token = form.get('turnstile');
    const submissionId = form.get('submissionId');
    if (!validContract(contract) || !(document instanceof File) ||
        document.size < 1000 || document.size > maxPdfBytes ||
        typeof token !== 'string' || !token || token.length > 2048 ||
        typeof submissionId !== 'string' || !/^[0-9a-f-]{36}$/i.test(submissionId))
      return respond({ error: 'Informations incomplètes ou invalides.' }, 400, origin);

    const bytes = new Uint8Array(await document.arrayBuffer());
    if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-')
      return respond({ error: 'Le document doit être un PDF.' }, 400, origin);

    let challenge;
    try {
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token,
          remoteip: request.headers.get('CF-Connecting-IP') || undefined }),
      });
      challenge = await verification.json();
    } catch { return respond({ error: 'Vérification indisponible. Réessayez.' }, 502, origin); }
    if (!challenge.success || challenge.hostname !== new URL(origin).hostname)
      return respond({ error: 'Vérification anti-spam expirée. Réessayez.' }, 403, origin);

    const attachment = { filename: `contrat-guillaume-sax-${contract.eventDate}.pdf`, content: base64(bytes) };
    const summary = `Nouveau contrat signé par ${contract.clientName}\n` +
      `Événement : ${contract.eventDate}\nLieu : ${contract.venue}\n` +
      `Devis : ${contract.quoteNumber}\nMontant : ${contract.total} €\n` +
      `Contact : ${contract.clientEmail} · ${contract.clientPhone}\n\n` +
      'Le contrat signé est joint en PDF.';
    const message = {
      from: env.MAIL_FROM,
      to: [env.MAIL_TO],
      ...(contract.copyToClient ? { cc: [contract.clientEmail] } : {}),
      reply_to: contract.clientEmail,
      subject: `Contrat de prestation signé · ${contract.eventDate} · ${contract.clientName}`,
      text: summary,
      attachments: [attachment],
    };
    let sent;
    try {
      sent = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': submissionId,
        },
        body: JSON.stringify(message),
      });
    } catch { return respond({ error: 'Envoi indisponible. Réessayez.' }, 502, origin); }
    if (!sent.ok) return respond({ error: 'Envoi indisponible. Réessayez.' }, 502, origin);
    const result = await sent.json().catch(() => ({}));
    if (!result.id) return respond({ error: 'Confirmation d’envoi indisponible.' }, 502, origin);
    return respond({ ok: true }, 200, origin);
  },
};
