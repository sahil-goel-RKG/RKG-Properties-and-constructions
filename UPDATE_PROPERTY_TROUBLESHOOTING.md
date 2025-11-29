# Update Property Troubleshooting Guide

## 401 Unauthorized Error - "No user ID found in session"

If you're getting a 401 error when trying to update a property, even though you're logged in, try these steps:

### Quick Fixes:

1. **Refresh the Page**
   - Sometimes the session needs to be refreshed
   - Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac) to do a hard refresh

2. **Re-login**
   - Sign out and sign back in
   - Go to `/admin/login` and log in again

3. **Clear Browser Cache and Cookies**
   - Clear your browser's cache and cookies for localhost
   - Then log in again

4. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check the Console tab for any errors
   - Check the Network tab to see the request/response details

5. **Restart Development Server**
   - Stop the server (Ctrl + C)
   - Delete `.next` folder if it exists
   - Restart with `npm run dev`

### Technical Details:

The API route uses Clerk's `auth()` function to verify authentication. If it's not finding the user ID, it could be due to:
- Session cookie not being sent with the request
- Session expired
- Middleware not properly passing auth context
- Clerk configuration issue

### Debugging:

Check the server console logs for:
- `API Update Route - Auth check:` - This shows if userId was found
- Any auth-related errors

If the issue persists, check:
1. Clerk environment variables are set correctly
2. Middleware is properly configured
3. Browser is allowing cookies for localhost

## Issue: Can't Update Properties Even When Logged In

### ✅ Step 1: Check Browser Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. Try to update a property
4. Look for errors like:
   - "Unauthorized"
   - "401" status codes
   - Authentication errors
   - Network errors

### ✅ Step 2: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to update a property
4. Find the request to `/api/projects/update`
5. Check:
   - **Status Code**: Should be 200 (not 401 or 403)
   - **Request Headers**: Should include authentication cookies
   - **Response**: Click on the request to see the response body

### ✅ Step 3: Verify You're Actually Logged In

1. Check if you see the **UserButton** (user avatar) in the header
2. Try logging out and logging back in
3. Check Clerk Dashboard → Users to verify your account is active

### ✅ Step 4: Check Server Logs

Look at your terminal where `npm run dev` is running. You should see:
- `API Update Route - Auth check:` with your userId
- Any error messages

### ✅ Step 5: Clear Browser Data

1. **Clear cookies** for your domain
2. **Clear localStorage**
3. **Hard refresh**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
4. **Log in again**
5. Try updating

### ✅ Step 6: Check Environment Variables

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Important**: Restart your dev server after updating environment variables!

### ✅ Step 7: Test Authentication

The form now checks authentication before submitting. If you see:
- "You must be logged in to update properties" → You're not authenticated
- Check if Clerk session is valid

---

## Common Error Messages

### "Unauthorized. Please sign in to update projects."
**Cause**: Clerk session not found or expired
**Fix**: 
1. Log out and log back in
2. Clear browser cookies
3. Check if Clerk keys are correct

### "Failed to update project"
**Cause**: Database error or validation error
**Fix**: Check server logs for detailed error message

### "Too many requests"
**Cause**: Rate limiting triggered
**Fix**: Wait a minute and try again

---

## Debug Information Added

The code now logs:
- User authentication status before submitting
- Response status codes
- Detailed error messages
- API route authentication checks

Check your browser console and server logs for these messages to diagnose the issue.

---

## Quick Fixes

1. **Restart dev server** (required after env changes)
2. **Clear browser cache and cookies**
3. **Log out and log back in**
4. **Check browser console** for specific error messages
5. **Check server terminal** for API route logs

---

**Last Updated**: $(date)

