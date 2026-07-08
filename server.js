const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'inquiries.json');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function clean(value) {
  return String(value || '').trim();
}

function loadInquiries() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveInquiry(inquiry) {
  const inquiries = loadInquiries();
  inquiries.unshift(inquiry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries.slice(0, 500), null, 2));
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function emailHtml(inquiry) {
  const rows = [
    ['Submitted', inquiry.submittedAt],
    ['Full Name', inquiry.fullName],
    ['Business Name', inquiry.businessName || 'N/A'],
    ['Phone', inquiry.phone],
    ['Email', inquiry.email],
    ['Space of Interest', inquiry.spaceInterest],
    ['Type of Business', inquiry.businessType],
    ['Business Description', inquiry.businessDescription],
    ['Currently Operating', inquiry.currentBusiness || 'N/A'],
    ['Time in Business', inquiry.yearsInBusiness || 'N/A'],
    ['Current Location', inquiry.currentLocation || 'N/A'],
    ['Desired Move-In', inquiry.moveIn || 'N/A'],
    ['Preferred Lease Term', inquiry.leaseTerm || 'N/A'],
    ['Questions / Comments', inquiry.comments || 'N/A']
  ];

  return `
  <div style="font-family:Arial,sans-serif;background:#f6f3ee;padding:24px;color:#172027;">
    <div style="max-width:720px;margin:auto;background:#fff;border:1px solid #e5dfd4;border-radius:14px;overflow:hidden;">
      <div style="background:#172027;color:#fff;padding:24px;">
        <h1 style="margin:0;font-size:24px;">New Commercial Space Inquiry</h1>
        <p style="margin:8px 0 0;color:#d5aa58;">Hueytown Commercial Suites</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${rows.map(([label, value]) => `
          <tr>
            <td style="width:210px;padding:14px 18px;border-bottom:1px solid #eee;font-weight:bold;background:#fbfaf8;">${escapeHtml(label)}</td>
            <td style="padding:14px 18px;border-bottom:1px solid #eee;white-space:pre-wrap;">${escapeHtml(value)}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  </div>`;
}

app.post('/submit-inquiry', async (req, res) => {
  const inquiry = {
    id: Date.now().toString(36),
    submittedAt: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
    fullName: clean(req.body.fullName),
    businessName: clean(req.body.businessName),
    phone: clean(req.body.phone),
    email: clean(req.body.email),
    spaceInterest: clean(req.body.spaceInterest),
    businessType: clean(req.body.businessType),
    businessDescription: clean(req.body.businessDescription),
    currentBusiness: clean(req.body.currentBusiness),
    yearsInBusiness: clean(req.body.yearsInBusiness),
    currentLocation: clean(req.body.currentLocation),
    moveIn: clean(req.body.moveIn),
    leaseTerm: clean(req.body.leaseTerm),
    comments: clean(req.body.comments),
    status: 'New'
  };

  const required = ['fullName', 'phone', 'email', 'spaceInterest', 'businessType', 'businessDescription'];
  const missing = required.filter((field) => !inquiry[field]);
  if (missing.length) {
    return res.status(400).send('Please complete all required fields.');
  }

  saveInquiry(inquiry);

  if (process.env.RESEND_API_KEY && process.env.EMAIL_TO) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Hueytown Commercial Suites <onboarding@resend.dev>',
        to: [process.env.EMAIL_TO],
        replyTo: inquiry.email,
        subject: `New Inquiry: ${inquiry.spaceInterest} - ${inquiry.fullName}`,
        html: emailHtml(inquiry)
      });
    } catch (error) {
      console.error('Email failed:', error);
    }
  }

  res.redirect('/thank-you.html');
});

app.get('/api/inquiries', (req, res) => {
  const pin = req.query.pin || req.headers['x-admin-pin'];
  if (!process.env.ADMIN_PIN || pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(loadInquiries());
});

app.listen(PORT, () => {
  console.log(`Hueytown Commercial Suites running on port ${PORT}`);
});
