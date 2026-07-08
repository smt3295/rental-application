# Commercial Space Inquiry Website

A simple Node.js website for commercial space inquiries.

## Available suites shown on the site

- Suite 101: 900 sq. ft. / $950 per month / water included
- Suite 105: 1,550 sq. ft. / $1,350 per month / water included
- Both suites together: approximately 2,450 sq. ft.

## Local setup

```bash
npm install
npm start
```

Open http://localhost:3000

## Render setup

Use these settings on Render:

- Build Command: `npm install`
- Start Command: `npm start`

Add these environment variables in Render:

```text
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your Gmail app password
EMAIL_TO=where-you-want-inquiries-sent@gmail.com
```

For Gmail, use a 16-digit Gmail App Password, not your normal Gmail password.
