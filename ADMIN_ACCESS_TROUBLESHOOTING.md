# Admin Page Access Troubleshooting

## Issue: Can't See Admin Page After Login

If you're logged in with Clerk but can't access the admin page, follow these steps:

### ✅ Step 1: Check Browser Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. Try accessing `/admin`
4. Look for errors like:
   - Authentication errors
   - Redirect loops
   - Network errors

### ✅ Step 2: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try accessing `/admin`
4. Look for:
   - Failed requests
   - Redirects (301/302)
   - Status codes

### ✅ Step 3: Verify You're Actually Logged In

1. Check if you see the **UserButton** component (user avatar) anywhere
2. Try accessing `/admin/login` - if you're logged in, Clerk should redirect you
3. Check Clerk Dashboard → Users to verify your account exists

### ✅ Step 4: Clear Browser Data

1. **Clear cookies** for your domain
2. **Clear localStorage**
3. **Hard refresh**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
4. Try logging in again

### ✅ Step 5: Check Environment Variables

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Important**: Restart your dev server after updating environment variables!

### ✅ Step 6: Check Middleware

The middleware should:
- Allow `/admin/login` (public)
- Protect `/admin/*` (require auth)
- Redirect unauthenticated users to `/admin/login`

### ✅ Step 7: Test Direct Access

Try accessing these URLs directly:
- `/admin/login` - Should show login form
- `/admin` - Should redirect to login if not authenticated, or show dashboard if authenticated

### ✅ Step 8: Check for Redirect Loops

If you see a redirect loop:
1. Check browser console for errors
2. Check if middleware is redirecting correctly
3. Check if admin page is redirecting when it shouldn't

### ✅ Step 9: Verify Clerk Session

1. Open browser DevTools → Application tab
2. Check **Cookies** for your domain
3. Look for Clerk session cookies (usually `__clerk_db_jwt` or similar)
4. If missing, you're not actually logged in

### ✅ Step 10: Check API Route Access

The admin page fetches from `/api/admin/contact-submissions`. Check:
1. Is this route protected?
2. Does it require authentication?
3. Are there any errors in the API response?

---

## Common Issues & Fixes

### Issue: "Redirecting to login" loop
**Fix**: Clear cookies and try again. Check middleware configuration.

### Issue: "Loading..." forever
**Fix**: Check if `useUser()` hook is working. Check browser console for errors.

### Issue: "Access Denied" or blank page
**Fix**: Verify you're logged in. Check if user object exists in Clerk.

### Issue: API errors when loading admin page
**Fix**: Check `/api/admin/contact-submissions` route. Verify authentication is working.

---

## Debug Steps

Add this to your admin page temporarily to debug:

```javascript
useEffect(() => {
  console.log('User state:', { user, isLoaded })
}, [user, isLoaded])
```

This will show you what Clerk is returning.

---

## Still Not Working?

1. **Check server logs** - Look at your terminal where `npm run dev` is running
2. **Check Clerk Dashboard** - Verify your user account is active
3. **Try a different browser** - Rule out browser-specific issues
4. **Check Next.js version** - Make sure it's compatible with your Clerk version

---

**Last Updated**: $(date)

