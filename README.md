# Hueytown Commercial Suites

Commercial property inquiry website for 1355 Hueytown Road, Hueytown, AL 35023.

## Render setup

Build Command:

```bash
npm install
```

Start Command:

```bash
npm start
```

Environment variables:

```bash
RESEND_API_KEY=your_resend_api_key
EMAIL_TO=where_inquiries_should_be_sent
ADMIN_PIN=private_pin_for_admin_page
```

## Admin page

After deployment, open:

```text
/admin.html
```

Enter the ADMIN_PIN to view inquiries saved on the server.

Note: On Render free services, saved inquiry history may reset after redeploys or restarts. Email notifications remain the primary record.
