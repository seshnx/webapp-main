/**
 * Email notification API endpoint
 * Supports SendGrid, Resend, or other email services
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, text, templateId, templateData } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing required fields: to, subject' });
    }

    // Check which email service is configured
    const emailService = process.env.EMAIL_SERVICE || 'resend'; // 'resend', 'sendgrid', 'nodemailer'

    let result;

    if (emailService === 'resend' && process.env.RESEND_API_KEY) {
      // Use Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'SeshNx <notifications@seshnx.com>',
          to,
          subject,
          html: html || text,
          text: text || html?.replace(/<[^>]*>/g, ''),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Email send failed' }));
        throw new Error(error.message || 'Email send failed');
      }

      result = await response.json();
    } else if (emailService === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      // Use SendGrid
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: process.env.EMAIL_FROM || 'notifications@seshnx.com' },
          subject,
          content: [
            { type: 'text/plain', value: text || html?.replace(/<[^>]*>/g, '') },
            { type: 'text/html', value: html || text },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Email send failed');
      }

      result = { success: true, message: 'Email sent' };
    } else {
      // Fallback: Log email (for development)
      console.log('Email notification (not sent - no service configured):', {
        to,
        subject,
        html: html || text,
      });
      result = { success: true, message: 'Email logged (no service configured)' };
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}

