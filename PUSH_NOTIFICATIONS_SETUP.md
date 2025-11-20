# Push Notifications Setup

## VAPID Keys Configuration

VAPID (Voluntary Application Server Identification) keys are required for Web Push notifications to work.

### Generated Keys

The following keys have been generated for you:

```
Public Key: BMhh7hLk9W7UHxUIarj4ueLQwPY5Vql56LmmM00epcXp-hLPUm_XfrdnNK1tIgshbREGOeVpaeU_MgmNldxE13U

Private Key: qztgauPc9Q3_4U0GKYHG29Ujt-xQ_9Oko6BZmzSDBl8
```

### Setup Instructions

1. **Add to your `.env` file** (in `apps/api/` directory):

```env
# Push Notifications (VAPID Keys)
VAPID_PUBLIC_KEY=BMhh7hLk9W7UHxUIarj4ueLQwPY5Vql56LmmM00epcXp-hLPUm_XfrdnNK1tIgshbREGOeVpaeU_MgmNldxE13U
VAPID_PRIVATE_KEY=qztgauPc9Q3_4U0GKYHG29Ujt-xQ_9Oko6BZmzSDBl8
VAPID_SUBJECT=mailto:your-email@example.com
```

**Important:** 
- Replace `your-email@example.com` with your actual email address
- The `VAPID_SUBJECT` should be either:
  - An email address: `mailto:your-email@example.com`
  - A URL: `https://yourdomain.com`

2. **For Production (Vercel):**

Add these as environment variables in your Vercel project settings:
- Go to your project → Settings → Environment Variables
- Add `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`

3. **Restart your API server** after adding the environment variables.

### Regenerating Keys

If you need to generate new keys:

```bash
cd apps/api
npx web-push generate-vapid-keys
```

### Testing

Once configured:
1. Go to your profile page
2. Enable push notifications
3. Click "Send Test" to verify everything works

### Security Notes

- **Never commit** your private key to version control
- Keep the private key secure - it's used to sign push notifications
- The public key is safe to expose (it's sent to browsers)
- Use different keys for development and production

