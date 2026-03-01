# Keja – Email setup (SMTP)

This guide explains how to send real emails from the Keja backend (e.g. welcome email after registration) instead of printing them to the console.

---

## When email is used

- **Welcome email** – Sent to the user’s email address after they register successfully.

---

## Development (default): console backend

If you **do not** set any email-related environment variables, Django uses the **console** backend:

- No real email is sent.
- The full email (subject, body, recipient) is **printed in the terminal** where you run `python manage.py runserver`.

No SMTP account or credentials are required for this.

---

## Production: send real emails (SMTP)

To send real emails, you must provide **SMTP credentials** via environment variables. The backend checks for `EMAIL_HOST`; if it is set, it uses SMTP instead of the console backend.

### 1. Get SMTP credentials

You need one of the following:

| Option | Description |
|--------|-------------|
| **Gmail** | Use your Gmail address + an [App Password](https://myaccount.google.com/apppasswords) (requires 2FA). Good for testing and low volume. |
| **Transactional service** | e.g. SendGrid, Mailgun, Amazon SES, Resend. Sign up, create an API/SMTP key, then use the SMTP host/port/user/password they provide. |
| **Your host’s mail server** | If your hosting provider (e.g. cPanel) or IT team gives you SMTP server, port, username, and password, use those. |

### 2. Environment variables

Set these in your environment (e.g. `.env` file or your host’s config). **Do not commit secrets to git.**

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `EMAIL_HOST` | Yes (to enable SMTP) | `smtp.gmail.com` | SMTP server hostname. |
| `EMAIL_PORT` | No | `587` | SMTP port (default: 587). |
| `EMAIL_USE_TLS` | No | `true` | Use TLS (default: true). |
| `EMAIL_HOST_USER` | Yes (if SMTP auth required) | `your@gmail.com` | SMTP username (often your email). |
| `EMAIL_HOST_PASSWORD` | Yes (if SMTP auth required) | `xxxx xxxx xxxx xxxx` | SMTP password or app password. |
| `DEFAULT_FROM_EMAIL` | No | `Keja <noreply@yourdomain.com>` | “From” address shown to recipients. |

### 3. Example: Gmail

1. Enable 2FA on your Google account.
2. Create an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords).
3. Set in your environment:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
DEFAULT_FROM_EMAIL=Keja <your@gmail.com>
```

### 4. Example: SendGrid (or similar)

Use the SMTP credentials from your SendGrid (or other provider) dashboard, for example:

```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=Keja <noreply@yourdomain.com>
```

### 5. Where this is used in the project

- **Settings:** `keja/apps/backend/keja_backend/settings.py` – email backend and SMTP configuration are set from the environment.
- **Sending:** `keja/apps/backend/users/views.py` – `send_welcome_email()` is called after successful registration.

---

## Summary

- **No `EMAIL_HOST` set** → Console backend; emails are only printed in the terminal.
- **`EMAIL_HOST` (and credentials) set** → SMTP backend; real emails are sent. You need an SMTP account (Gmail, SendGrid, or your host’s mail server) to get the host, port, user, and password for these variables.
