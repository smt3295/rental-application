require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function required(value) {
  return value && String(value).trim().length > 0;
}

app.post('/submit-inquiry', async (req, res) => {
  try {
    const data = req.body;

    if (!required(data.fullName) || !required(data.phone) || !required(data.email) || !required(data.spaceInterest) || !required(data.businessType)) {
      return res.status(400).send('Please complete all required fields.');
    }

    const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });

    const plainText = `NEW COMMERCIAL SPACE INQUIRY\n\nSubmitted: ${submittedAt}\n\nCONTACT INFORMATION\nFull Name: ${data.fullName}\nBusiness Name: ${data.businessName || 'N/A'}\nPhone: ${data.phone}\nEmail: ${data.email}\n\nSPACE OF INTEREST\n${data.spaceInterest}\n\nABOUT THE BUSINESS\nBusiness Type: ${data.businessType}\nCurrently Operating: ${data.currentBusiness || 'N/A'}\nTime in Business: ${data.yearsInBusiness || 'N/A'}\nCurrent Business Location: ${data.currentLocation || 'N/A'}\n\nLEASE INFORMATION\nDesired Move-In: ${data.moveIn || 'N/A'}\nPreferred Lease Term: ${data.leaseTerm || 'N/A'}\n\nQUESTIONS OR COMMENTS\n${data.comments || 'N/A'}\n\nConsent Checked: ${data.consent ? 'Yes' : 'No'}\n`;

    const html = `
      <h2>New Commercial Space Inquiry</h2>
      <p><strong>Submitted:</strong> ${submittedAt}</p>
      <h3>Contact Information</h3>
      <p><strong>Full Name:</strong> ${data.fullName}</p>
      <p><strong>Business Name:</strong> ${data.businessName || 'N/A'}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <h3>Space of Interest</h3>
      <p>${data.spaceInterest}</p>
      <h3>About the Business</h3>
      <p><strong>Business Type:</strong> ${data.businessType}</p>
      <p><strong>Currently Operating:</strong> ${data.currentBusiness || 'N/A'}</p>
      <p><strong>Time in Business:</strong> ${data.yearsInBusiness || 'N/A'}</p>
      <p><strong>Current Business Location:</strong> ${data.currentLocation || 'N/A'}</p>
      <h3>Lease Information</h3>
      <p><strong>Desired Move-In:</strong> ${data.moveIn || 'N/A'}</p>
      <p><strong>Preferred Lease Term:</strong> ${data.leaseTerm || 'N/A'}</p>
      <h3>Questions or Comments</h3>
      <p>${(data.comments || 'N/A').replace(/\n/g, '<br>')}</p>
    `;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_TO) {
      console.log(plainText);
      return res.redirect('/thank-you.html');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `Commercial Space Inquiry <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: data.email,
      subject: `New Commercial Space Inquiry - ${data.spaceInterest}`,
      text: plainText,
      html
    });

    res.redirect('/thank-you.html');
  } catch (error) {
    console.error(error);
    res.status(500).send('There was a problem submitting the inquiry. Please try again later.');
  }
});

app.listen(PORT, () => {
  console.log(`Commercial space site running on port ${PORT}`);
});
