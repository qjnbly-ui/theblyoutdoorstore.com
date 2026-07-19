const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const RECIPIENT = 'qjnbly@hotmail.com';
const DEFAULT_FROM = 'The Bly Outdoor Store <contact@theblyoutdoorstore.com>';

function sendJson(response, status, body) {
  response.status(status).setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  return response.end(JSON.stringify(body));
}

function cleanLine(value, maxLength) {
  return String(value || '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function cleanMessage(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = async function contact(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { error: 'Method not allowed.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured.');
    return sendJson(response, 503, { error: 'Email service is not configured yet.' });
  }

  const body = request.body || {};

  // Bots commonly fill this field, while real visitors never see it.
  if (body.website) {
    return sendJson(response, 200, { ok: true });
  }

  const name = cleanLine(body.name, 100);
  const email = cleanLine(body.email, 254);
  const phone = cleanLine(body.phone, 50);
  const subject = cleanLine(body.subject, 150);
  const message = cleanMessage(body.message, 5000);
  const startedAt = Number(body.startedAt);

  if (!name || !isEmail(email) || !subject || !message) {
    return sendJson(response, 400, { error: 'Please complete all required fields with a valid email address.' });
  }

  // Reject submissions completed impossibly fast or from stale automated pages.
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || elapsed < 1500 || elapsed > 24 * 60 * 60 * 1000) {
    return sendJson(response, 400, { error: 'Please refresh the page and try again.' });
  }

  const emailText = [
    message,
    '',
    '— Contact details —',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`
  ].join('\n');

  try {
    const resendResponse = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
        to: [RECIPIENT],
        reply_to: email,
        subject: `Website inquiry: ${subject}`,
        text: emailText
      })
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error('Resend rejected the contact email:', resendResponse.status, resendError);
      return sendJson(response, 502, { error: 'We could not send your message. Please try again or call the store.' });
    }

    return sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error('Contact email request failed:', error);
    return sendJson(response, 502, { error: 'We could not send your message. Please try again or call the store.' });
  }
};
