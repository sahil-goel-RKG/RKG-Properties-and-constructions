# Clerk Domain Configuration Guide

## Issue: Admin Side Not Working After Adding Custom Domain

When you add a custom domain to your production deployment, Clerk authentication may stop working because Clerk needs to be configured to recognize your new domain.

## Solution Steps

### 1. Configure Domain in Clerk Dashboard

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Navigate to**: Your Application → **Domains**
3. **Add Your Custom Domain**:
   - Click "Add Domain" or "Configure Domain"
   - Enter your custom domain (e.g., `yourdomain.com`)
   - Add both root domain and www subdomain if needed:
     - `yourdomain.com`
     - `www.yourdomain.com`
4. **Verify Domain Ownership** (if required):
   - Follow Clerk's domain verification process
   - This may involve adding DNS records

### 2. Update Environment Variables

Make sure your production environment has the correct Clerk keys:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**Important**: 
- Use **live** keys (not test keys) for production
- Ensure the keys match the Clerk application where you added the domain

### 3. Configure Allowed Origins

In Clerk Dashboard:
1. Go to **Settings** → **Paths**
2. Check **Allowed Redirect URLs**:
   - Add: `https://yourdomain.com/**`
   - Add: `https://www.yourdomain.com/**`
   - Add: `https://yourdomain.com/admin/login`
   - Add: `https://yourdomain.com/admin/**`

### 4. Configure Sign-In/Sign-Up URLs

In Clerk Dashboard:
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Ensure **Redirect URLs** include:
   - `https://yourdomain.com/admin/login`
   - `https://yourdomain.com/admin`

### 5. Clear Browser Cache & Cookies

After configuration:
- Clear browser cache and cookies for your domain
- Try logging in again in an incognito/private window

### 6. Verify Proxy Configuration

The code has been updated to handle custom domains correctly. The proxy now uses the request origin to construct redirect URLs properly.

## Troubleshooting

### Issue: "Invalid redirect URL"
- **Solution**: Add the exact redirect URL to Clerk's allowed redirect URLs list

### Issue: Cookies not being set
- **Solution**: 
  - Check if your domain is properly configured in Clerk
  - Ensure you're using HTTPS (required for secure cookies)
  - Check browser console for cookie-related errors

### Issue: Authentication works but redirects fail
- **Solution**: 
  - Verify the `returnUrl` parameter is being preserved
  - Check that all admin routes are properly configured in Clerk

### Issue: CORS errors
- **Solution**: 
  - Ensure your domain is added to Clerk's allowed origins
  - Check `next.config.js` CSP headers allow Clerk domains

## Testing

1. **Test Admin Login**:
   - Visit: `https://yourdomain.com/admin`
   - Should redirect to: `https://yourdomain.com/admin/login`
   - After login, should redirect back to: `https://yourdomain.com/admin`

2. **Test API Routes**:
   - Try accessing admin API routes after login
   - Check browser network tab for authentication headers

3. **Check Console**:
   - Open browser DevTools
   - Look for any Clerk-related errors
   - Check for cookie/session issues

## Additional Notes

- The proxy has been updated to use `request.headers.get('origin')` to ensure correct domain handling
- All redirect URLs now use the request origin instead of hardcoded values
- This ensures compatibility with both custom domains and subdomains

## Support

If issues persist:
1. Check Clerk Dashboard logs for authentication attempts
2. Verify all environment variables are set correctly
3. Ensure your deployment platform (Vercel, etc.) has the correct environment variables
4. Check Clerk's status page: https://status.clerk.com

