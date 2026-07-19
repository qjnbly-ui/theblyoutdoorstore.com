const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const RECIPIENT = 'qjnbly@hotmail.com';
const DEFAULT_FROM = 'The Bly Outdoor Store <info@theblyoutdoorstore.com>';
const STORE_EMAIL = 'info@theblyoutdoorstore.com';
const STORE_EMAIL_LINK = 'theoutdoorstore2016@gmail.com';
const STORE_LOGO = 'https://vdbjlgmbpykjblprqnak.supabase.co/storage/v1/object/public/website-assets-public/a2f7a988-fc9f-4e54-ad60-889beeb79cd8/9f482d52-7bf9-4a31-a778-bb5d114c48be/v1-theblyoutdoorstorelogo.png';

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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildEmailHtml({ name, email, phone, subject, message }) {
  const messageHtml = escapeHtml(message).replace(/\n/g, '<br>');
  const detailRow = (label, value) => `
    <tr>
      <td style="padding:9px 14px 9px 0;color:#6b6f65;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;vertical-align:top;">${label}</td>
      <td style="padding:9px 0;color:#24271f;font-size:15px;vertical-align:top;">${value}</td>
    </tr>`;

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f0e7;font-family:Arial,sans-serif;color:#24271f;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f0e7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:28px 32px 24px;border-top:6px solid #536a2c;">
              <img src="${STORE_LOGO}" width="240" alt="The Bly Outdoor Store" style="display:block;width:240px;max-width:100%;height:auto;">
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px;background:#293719;color:#ffffff;">
              <div style="color:#c6da63;font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;">New website message</div>
              <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">${escapeHtml(subject)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 36px;">
              <div style="font-size:16px;line-height:1.7;">${messageHtml}</div>
              <div style="margin:30px 0 18px;border-top:1px solid #e1ded7;"></div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                ${detailRow('Name', escapeHtml(name))}
                ${detailRow('Email', `<a href="mailto:${escapeHtml(email)}" style="color:#536a2c;font-weight:700;">${escapeHtml(email)}</a>`)}
                ${detailRow('Phone', escapeHtml(phone || 'Not provided'))}
              </table>
              <p style="margin:26px 0 0;color:#6b6f65;font-size:13px;line-height:1.6;">Reply to this email to respond directly to ${escapeHtml(name)}.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:22px 32px;background:#f7f7f4;color:#6b6f65;font-size:12px;line-height:1.6;">
              The Bly Outdoor Store<br>
              61556 Hwy 140 East, Bly, Oregon<br>
              <a href="mailto:${STORE_EMAIL_LINK}" style="color:#536a2c;">${STORE_EMAIL}</a> &nbsp;•&nbsp; (541) 362-6047
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
        html: buildEmailHtml({ name, email, phone, subject, message }),
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
