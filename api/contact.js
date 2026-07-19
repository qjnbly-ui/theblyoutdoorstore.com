const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const RECIPIENT = 'theoutdoorstore2016@gmail.com';
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
      <td class="detail-label" style="width:76px;padding:8px 14px 8px 0;color:#697064;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;vertical-align:top;">${label}</td>
      <td class="body-text" style="padding:8px 0;color:#20251d;font-size:15px;line-height:1.45;vertical-align:top;">${value}</td>
    </tr>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media only screen and (max-width: 520px) {
      .email-shell { padding: 12px 8px !important; }
      .logo-panel { padding: 20px 24px !important; }
      .logo-panel img { width: 190px !important; }
      .hero-panel, .content-panel { padding-left: 22px !important; padding-right: 22px !important; }
      .hero-title { font-size: 24px !important; }
    }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #10150c !important; }
      .email-card, .content-panel { background-color: #1c2417 !important; }
      .logo-panel { background-color: #f7f5ee !important; }
      .message-box { background-color: #252f20 !important; border-color: #39462f !important; }
      .details-box { background-color: #151c12 !important; border-color: #39462f !important; }
      .body-text { color: #f2f4ed !important; }
      .detail-label, .muted-text { color: #b9c0b2 !important; }
      .footer-panel { background-color: #151c12 !important; color: #b9c0b2 !important; border-color: #39462f !important; }
      .email-link { color: #c6da63 !important; }
    }
    [data-ogsc] .email-bg { background-color: #10150c !important; }
    [data-ogsc] .email-card, [data-ogsc] .content-panel { background-color: #1c2417 !important; }
    [data-ogsc] .logo-panel { background-color: #f7f5ee !important; }
    [data-ogsc] .message-box { background-color: #252f20 !important; border-color: #39462f !important; }
    [data-ogsc] .details-box, [data-ogsc] .footer-panel { background-color: #151c12 !important; border-color: #39462f !important; }
    [data-ogsc] .body-text { color: #f2f4ed !important; }
    [data-ogsc] .detail-label, [data-ogsc] .muted-text, [data-ogsc] .footer-panel { color: #b9c0b2 !important; }
    [data-ogsc] .email-link { color: #c6da63 !important; }
  </style>
</head>
<body class="email-bg" style="margin:0;padding:0;background:#f1eee6;font-family:Arial,Helvetica,sans-serif;color:#20251d;">
  <table class="email-bg" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1eee6;">
    <tr>
      <td class="email-shell" align="center" style="padding:28px 14px;">
        <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-collapse:collapse;border-radius:8px;overflow:hidden;box-shadow:0 8px 28px rgba(32,39,29,.10);">
          <tr>
            <td class="logo-panel" align="center" style="padding:22px 32px;background:#f7f5ee;border-top:5px solid #536a2c;">
              <img src="${STORE_LOGO}" width="205" alt="The Bly Outdoor Store" style="display:block;width:205px;max-width:100%;height:auto;">
            </td>
          </tr>
          <tr>
            <td class="hero-panel" style="padding:24px 32px;background:#293719;color:#ffffff;border-bottom:4px solid #c6da63;">
              <div style="color:#c6da63;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;">New website inquiry</div>
              <h1 class="hero-title" style="margin:8px 0 0;color:#ffffff;font-size:27px;line-height:1.25;">${escapeHtml(subject)}</h1>
            </td>
          </tr>
          <tr>
            <td class="content-panel" style="padding:28px 32px 30px;background:#ffffff;">
              <div class="message-box body-text" style="padding:20px 22px;background:#f7f8f4;border:1px solid #e1e5dc;border-left:4px solid #536a2c;color:#20251d;font-size:16px;line-height:1.65;">${messageHtml}</div>
              <div class="muted-text" style="margin:25px 0 9px;color:#697064;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">From</div>
              <table class="details-box" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:13px 18px;background:#f7f8f4;border:1px solid #e1e5dc;border-collapse:separate;border-radius:5px;">
                ${detailRow('Name', escapeHtml(name))}
                ${detailRow('Email', `<a class="email-link" href="mailto:${escapeHtml(email)}" style="color:#536a2c;font-weight:700;">${escapeHtml(email)}</a>`)}
                ${detailRow('Phone', escapeHtml(phone || 'Not provided'))}
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:22px;">
                <tr>
                  <td style="background:#536a2c;border-radius:4px;">
                    <a href="mailto:${escapeHtml(email)}" style="display:inline-block;padding:13px 22px;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:.06em;text-decoration:none;text-transform:uppercase;">Reply to ${escapeHtml(name)}</a>
                  </td>
                </tr>
              </table>
              <p class="muted-text" style="margin:14px 0 0;color:#697064;font-size:12px;line-height:1.5;">Replying normally will also send your response directly to the customer.</p>
            </td>
          </tr>
          <tr>
            <td class="footer-panel" align="center" style="padding:19px 28px;background:#f7f8f4;border-top:1px solid #e1e5dc;color:#697064;font-size:11px;line-height:1.7;">
              <strong class="body-text" style="color:#20251d;">The Bly Outdoor Store</strong><br>
              61556 Hwy 140 East · Bly, Oregon<br>
              <a class="email-link" href="mailto:${STORE_EMAIL_LINK}" style="color:#536a2c;text-decoration:none;">${STORE_EMAIL}</a> &nbsp;·&nbsp; <a class="email-link" href="tel:+15413626047" style="color:#536a2c;text-decoration:none;">(541) 362-6047</a>
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
