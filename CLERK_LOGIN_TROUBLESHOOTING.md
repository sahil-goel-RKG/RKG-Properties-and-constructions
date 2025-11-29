# Clerk Login Troubleshooting Guide

## Common Issues After Updating Clerk Keys

### ✅ Step 1: Verify Environment Variables

Make sure your `.env.local` file has the correct keys:

```env
# Required Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Optional (but recommended)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# If using webhooks
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Important Notes:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must start with `pk_test_` (test) or `pk_live_` (production)
- `CLERK_SECRET_KEY` must start with `sk_test_` (test) or `sk_live_` (production)
- Both keys must be from the **same Clerk application**
- Keys are case-sensitive

---

### ✅ Step 2: Restart Your Development Server

**CRITICAL**: After updating environment variables, you MUST restart your dev server:

1. **Stop the server** (Ctrl+C in terminal)
2. **Start it again**:
   ```bash
   npm run dev
   ```

Environment variables are only loaded when the server starts. Changes won't take effect until you restart.

---

### ✅ Step 3: Clear Browser Cache

1. **Hard refresh** your browser:
   - **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
   - **Mac**: `Cmd + Shift + R`

2. **Or clear browser cache**:
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

3. **Or use Incognito/Private mode** to test

---

### ✅ Step 4: Verify Keys Match

**Both keys must be from the same Clerk application:**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to **API Keys** section
4. Verify:
   - Publishable Key matches `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret Key matches `CLERK_SECRET_KEY`
   - Both are from the **same application**

**Common Mistake**: Using keys from different Clerk applications will cause login to fail.

---

### ✅ Step 5: Check for Typos

Common issues:
- Extra spaces before/after keys
- Missing `NEXT_PUBLIC_` prefix on publishable key
- Wrong variable names
- Quotes around values (should NOT have quotes)

**Correct:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc123
CLERK_SECRET_KEY=sk_test_xyz789
```

**Wrong:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_abc123"  # ❌ No quotes
CLERK_SECRET_KEY = sk_test_xyz789                    # ❌ No spaces around =
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc123     # ❌ Missing NEXT_PUBLIC_
```

---

### ✅ Step 6: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try to login
4. Look for errors like:
   - `Clerk: Missing publishableKey`
   - `Clerk: Invalid API key`
   - `Clerk: Authentication failed`

These errors will tell you exactly what's wrong.

---

### ✅ Step 7: Verify Clerk Application Settings

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Check **Settings**:
   - **Allowed Origins**: Make sure your domain is allowed
   - **Redirect URLs**: Should include your app URL
   - **Authentication Methods**: Ensure your login method is enabled

---

### ✅ Step 8: Test with New Keys

If nothing works, try creating a fresh set of keys:

1. Go to Clerk Dashboard → API Keys
2. Click **Create Key** (or regenerate existing)
3. Copy the new keys
4. Update `.env.local`
5. **Restart dev server**
6. Clear browser cache
7. Try logging in again

---

### ✅ Step 9: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Look for failed requests to `clerk.com` or `clerk.accounts.dev`
5. Check the error response

---

## Quick Fix Checklist

- [ ] Environment variables are in `.env.local` (not `.env`)
- [ ] Both keys are from the same Clerk application
- [ ] Keys don't have quotes or extra spaces
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` has `NEXT_PUBLIC_` prefix
- [ ] Dev server was restarted after updating keys
- [ ] Browser cache was cleared
- [ ] No typos in variable names or values
- [ ] Keys are correct format (`pk_test_...` and `sk_test_...`)
- [ ] **For CAPTCHA issues**: Dev server restarted after CSP update, browser extensions disabled

---

## Still Not Working?

### Check Server Logs

Look at your terminal where `npm run dev` is running. You might see errors like:
- `Missing CLERK_SECRET_KEY`
- `Invalid Clerk configuration`

### Verify File Location

Make sure `.env.local` is in the **root** of your project:
```
sahil_goel_reas_india/
  ├── .env.local          ← Should be here
  ├── app/
  ├── components/
  └── package.json
```

### Test Environment Variables

Create a test route to verify keys are loaded (remove after testing):

```javascript
// app/test-env/route.js
export async function GET() {
  return Response.json({
    hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    hasSecretKey: !!process.env.CLERK_SECRET_KEY,
    publishableKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10),
  })
}
```

Visit `/test-env` to see if keys are loaded.

---

## Common Error Messages

### "The CAPTCHA failed to load"
**This is usually caused by Content Security Policy (CSP) blocking Google reCAPTCHA**

**Fix**: The CSP headers have been updated to allow Clerk's CAPTCHA. After updating:
1. **Restart your dev server** (required for config changes)
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Disable browser extensions** that block scripts (ad blockers, privacy tools)
4. **Try a different browser** or incognito mode

**If still not working:**
- Check browser console for CSP violations
- Temporarily disable CSP in `next.config.js` to test
- Check if Clerk's bot protection is enabled in dashboard

### "Missing publishableKey"
- **Fix**: Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set and has `NEXT_PUBLIC_` prefix

### "Invalid API key"
- **Fix**: Keys don't match or are from different applications

### "Authentication failed"
- **Fix**: Check Clerk dashboard for application status, verify user exists

### "Clerk: Error"
- **Fix**: Check browser console and server logs for detailed error

---

## Need More Help?

1. Check [Clerk Documentation](https://clerk.com/docs)
2. Check [Clerk Discord Community](https://clerk.com/discord)
3. Review your Clerk Dashboard for application status

---

**Last Updated**: $(date)

