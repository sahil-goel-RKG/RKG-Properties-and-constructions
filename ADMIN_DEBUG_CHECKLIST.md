# Admin Not Working - Debug Checklist

## Quick Checks (Do These First)

### 1. ✅ Verify Environment Variables Are Set

In your deployment platform (Vercel/Netlify/etc.), check these are set:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  # Must be LIVE key, not test
CLERK_SECRET_KEY=sk_live_...                    # Must be LIVE key, not test
```

**Critical**: After redeploying, environment variables might not be set. Check your deployment platform's environment variables section.

### 2. ✅ Verify Clerk Domain Configuration

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **Domains** section
4. Verify your production domain (`rkgproperties.in`) is listed
5. If not, add it following `CLERK_DOMAIN_SETUP.md`

### 3. ✅ Check Browser Console for Errors

1. Open your production site: `https://rkgproperties.in/admin`
2. Open Browser DevTools (F12)
3. Check **Console** tab for errors:
   - Clerk initialization errors?
   - Authentication errors?
   - Cookie errors?
4. Check **Network** tab:
   - Are requests to `/api/admin/*` returning 401?
   - Are Clerk API calls failing?

### 4. ✅ Test Authentication Flow

1. Visit: `https://rkgproperties.in/admin`
   - Should redirect to: `https://rkgproperties.in/admin/login`
   - If it doesn't redirect, the proxy middleware isn't working

2. Try to log in
   - Does the login form appear?
   - After login, does it redirect back to `/admin`?
   - Or does it show an error?

### 5. ✅ Verify proxy.js is Running

The `proxy.js` file should be automatically picked up by Next.js 16.

**Check if it's working:**
- Visit `https://rkgproperties.in/admin` (not logged in)
- Should immediately redirect to `/admin/login`
- If you see the admin page content without login, the proxy is NOT working

## Common Issues & Solutions

### Issue 1: "Admin page shows without login"

**Cause**: Proxy middleware not running or Clerk auth failing silently

**Solution**:
1. Check if `proxy.js` exists in root directory
2. Verify Clerk environment variables are set
3. Check deployment logs for errors

### Issue 2: "Login works but admin page shows error"

**Cause**: API routes failing authentication

**Solution**:
1. Check browser Network tab - are API calls returning 401?
2. Verify `CLERK_SECRET_KEY` is set correctly
3. Check server logs for authentication errors

### Issue 3: "Infinite redirect loop"

**Cause**: Clerk domain not configured or redirect URLs incorrect

**Solution**:
1. Follow `CLERK_DOMAIN_SETUP.md` Step 3 and 4
2. Verify redirect URLs in Clerk Dashboard
3. Clear browser cookies and try again

### Issue 4: "Environment variables not working"

**Cause**: Variables not set in deployment platform

**Solution**:
1. Go to your deployment platform (Vercel/Netlify/etc.)
2. Navigate to: Project Settings → Environment Variables
3. Add/verify:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. **Redeploy** after adding variables

## Testing Steps

### Step 1: Test Proxy Middleware
```bash
# Visit (not logged in):
https://rkgproperties.in/admin

# Expected: Redirects to /admin/login
# If not: proxy.js is not working
```

### Step 2: Test Login
```bash
# Visit:
https://rkgproperties.in/admin/login

# Try to log in
# Expected: After login, redirects to /admin
# If not: Clerk domain/redirect URL issue
```

### Step 3: Test API Routes
```bash
# After logging in, open browser console
# Check Network tab for:
/api/admin/contact-submissions

# Expected: Returns 200 with data
# If 401: Authentication is failing
```

## Quick Fixes to Try

### Fix 1: Re-add Environment Variables
1. Copy your Clerk keys from Clerk Dashboard
2. Go to deployment platform
3. Delete and re-add environment variables
4. Redeploy

### Fix 2: Clear Clerk Cache
1. In Clerk Dashboard → Your App → Settings
2. Check for any cache/domain issues
3. Try removing and re-adding your domain

### Fix 3: Verify proxy.js Export
Make sure `proxy.js` exports correctly:
```javascript
export const proxy = clerkMiddleware(...)
```

### Fix 4: Check Next.js Version
Make sure you're using Next.js 16+ (proxy.js is for Next.js 16)

## Still Not Working?

1. **Check deployment logs** - Look for errors during build/deploy
2. **Check server logs** - Look for runtime errors
3. **Test in incognito** - Rule out browser cache issues
4. **Verify Clerk Dashboard** - Check if authentication attempts are being logged

## Emergency Workaround

If nothing works, temporarily add explicit auth check in each admin page:

```javascript
// In each admin page, add at the top:
useEffect(() => {
  if (!isLoaded) return;
  if (!user) {
    window.location.href = '/admin/login';
  }
}, [isLoaded, user]);
```

But this is NOT secure - fix the root cause instead!

