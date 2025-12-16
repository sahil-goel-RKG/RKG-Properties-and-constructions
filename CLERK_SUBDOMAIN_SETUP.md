# Setup Clerk Subdomain (clerk.rkgproperties.in)

## Problem
Clerk is trying to load from `clerk.rkgproperties.in` but the subdomain doesn't exist. Since you're using Clerk production which requires a custom domain, you must configure the subdomain.

## Step-by-Step Setup

### Step 1: Configure Subdomain in Clerk Dashboard

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Select your Production instance** (not Development)
3. **Navigate to**: **Settings** → **Domains**
4. **Find your domain** `rkgproperties.in` in the list
5. **Click on it** to see subdomain configuration options
6. **Look for "Frontend API" or "Clerk Subdomain"** section
7. **Enable/Configure** the `clerk` subdomain

### Step 2: Get DNS Instructions from Clerk

1. In Clerk Dashboard → **Settings** → **Domains**
2. Click on `rkgproperties.in`
3. Look for **DNS Configuration** or **Subdomain Setup**
4. Clerk will show you:
   - The CNAME record to add
   - The target value (something like `clerk.rkgproperties.in.cdn.clerk.com` or similar)

### Step 3: Add DNS Record

1. **Go to your DNS provider** (where you manage `rkgproperties.in`)
   - Could be: GoDaddy, Namecheap, Cloudflare, etc.

2. **Add a CNAME record**:
   ```
   Type: CNAME
   Name: clerk
   Value: [The value Clerk provided - usually ends with .clerk.com or .cdn.clerk.com]
   TTL: 3600 (or Auto)
   ```

3. **Example** (your actual value will be different):
   ```
   clerk.rkgproperties.in → clerk-xxxxx.cdn.clerk.com
   ```

### Step 4: Wait for DNS Propagation

1. **Verify DNS is working**:
   ```bash
   # In terminal/command prompt:
   nslookup clerk.rkgproperties.in
   
   # Or use online tool:
   # https://dnschecker.org
   ```

2. **Wait 15 minutes to 48 hours** for DNS to propagate
   - Usually takes 15-30 minutes
   - Can take up to 48 hours in rare cases

### Step 5: Deploy Certificates in Clerk

1. **Go back to Clerk Dashboard** → **Settings** → **Domains**
2. **Click on your domain** `rkgproperties.in`
3. **Click "Deploy Certificates"** or "Issue SSL Certificate"
4. **Wait for certificate deployment** (usually 5-10 minutes)

### Step 6: Verify It's Working

1. **Test the subdomain**:
   - Visit: `https://clerk.rkgproperties.in` in browser
   - Should show Clerk's API endpoint (not an error)

2. **Test your login page**:
   - Visit: `https://rkgproperties.in/admin/login`
   - The SignIn component should now load without errors

## Troubleshooting

### DNS Not Propagating
- Check DNS record is correct
- Wait longer (up to 48 hours)
- Try different DNS checker tools
- Contact your DNS provider

### Certificate Not Deploying
- Ensure DNS is fully propagated first
- Check Clerk Dashboard for error messages
- Try clicking "Deploy Certificates" again

### Still Getting Errors
- Clear browser cache
- Check browser console for new errors
- Verify environment variables are set correctly
- Check Clerk Dashboard → Logs for errors

## Alternative: Use Clerk's Proxy Domain

If subdomain setup is too complex, you can use Clerk's proxy domain feature:

1. In Clerk Dashboard → **Settings** → **Domains**
2. Look for **"Use Proxy Domain"** option
3. Enable it if available
4. This uses Clerk's infrastructure instead of your subdomain

## Important Notes

- ✅ Your main domain (`rkgproperties.in`) doesn't need any changes
- ✅ Only the `clerk` subdomain needs DNS configuration
- ✅ This is a one-time setup
- ✅ Once configured, it works permanently

## Quick Checklist

- [ ] Subdomain configured in Clerk Dashboard
- [ ] CNAME DNS record added
- [ ] DNS propagated (verified with nslookup)
- [ ] SSL certificate deployed in Clerk
- [ ] Tested login page - SignIn component loads
- [ ] No errors in browser console

