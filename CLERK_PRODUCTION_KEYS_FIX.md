# Fix: Production Keys Not Working (Development Keys Work)

## Problem
- ✅ Development keys work perfectly
- ❌ Production keys fail - admin doesn't work

## Common Causes

### 1. Wrong Keys (Most Common)
**Issue**: Using development keys in production, or keys from wrong Clerk instance

**Check:**
1. Go to Clerk Dashboard
2. **Switch to Production instance** (top dropdown)
3. Go to **API Keys**
4. Copy the **LIVE** keys:
   - `pk_live_...` (not `pk_test_...`)
   - `sk_live_...` (not `sk_test_...`)

**Fix:**
- In your deployment platform, set:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (from Production)
  CLERK_SECRET_KEY=sk_live_... (from Production)
  ```
- **Redeploy** after updating

### 2. Keys from Different Clerk Application
**Issue**: Production keys are from a different Clerk application than your domain

**Check:**
1. In Clerk Dashboard → Production instance
2. Go to **Settings** → **Domains**
3. Verify `rkgproperties.in` is listed
4. If not, you're using keys from wrong application

**Fix:**
- Use keys from the Clerk application that has `rkgproperties.in` configured
- Or add your domain to the current Clerk application

### 3. Production Instance Not Configured
**Issue**: Production instance exists but isn't fully set up

**Check in Clerk Dashboard (Production instance):**
1. **Settings** → **Domains**
   - Is `rkgproperties.in` added?
   - Is it verified?

2. **Settings** → **Paths**
   - Are redirect URLs configured?
   - Are sign-in/sign-up URLs set?

3. **API Keys**
   - Do you see `pk_live_...` and `sk_live_...`?
   - Are they enabled?

### 4. Environment Variables Not Set in Production
**Issue**: Keys are set in development but not in production deployment

**Check:**
1. Go to your deployment platform (Vercel/Netlify/etc.)
2. Navigate to: **Project Settings** → **Environment Variables**
3. Verify these exist:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   ```
4. Check if they're set for **Production** environment (not just Preview/Development)

**Fix:**
- Add/update the variables
- Make sure they're set for **Production** environment
- **Redeploy** after adding

### 5. Domain Mismatch
**Issue**: Production keys are for a different domain

**Check:**
1. In Clerk Dashboard → Production → Settings → Domains
2. What domain is configured?
3. Does it match `rkgproperties.in`?

**Fix:**
- If domain doesn't match, either:
  - Add `rkgproperties.in` to this Clerk application
  - Or use keys from the Clerk application that has `rkgproperties.in`

## Step-by-Step Debugging

### Step 1: Verify Keys in Deployment Platform
1. Go to deployment platform → Environment Variables
2. Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`:
   - Does it start with `pk_live_`? ✅
   - Does it start with `pk_test_`? ❌ (Wrong - use production keys)
3. Check `CLERK_SECRET_KEY`:
   - Does it start with `sk_live_`? ✅
   - Does it start with `sk_test_`? ❌ (Wrong - use production keys)

### Step 2: Verify Keys in Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. **Switch to Production instance** (important!)
3. Go to **API Keys**
4. Compare with your deployment platform variables
5. They should match exactly

### Step 3: Check Domain Configuration
1. In Clerk Dashboard → Production → Settings → Domains
2. Is `rkgproperties.in` listed?
3. Is it verified/active?
4. If not, add it following `CLERK_DOMAIN_SETUP.md`

### Step 4: Test in Browser Console
1. Visit your production site: `https://rkgproperties.in/admin/login`
2. Open Browser DevTools (F12) → Console
3. Check for errors:
   - "Invalid publishable key" → Wrong key format
   - "Domain mismatch" → Domain not configured
   - "Failed to load" → Subdomain issue (see CLERK_SUBDOMAIN_FIX.md)

## Quick Fix Checklist

- [ ] Using `pk_live_...` and `sk_live_...` (not test keys)
- [ ] Keys are from Production instance in Clerk Dashboard
- [ ] Keys match the Clerk application with `rkgproperties.in` domain
- [ ] Environment variables set in deployment platform
- [ ] Environment variables set for **Production** environment
- [ ] Redeployed after setting variables
- [ ] Domain `rkgproperties.in` added in Clerk Dashboard → Production
- [ ] Domain verified/active in Clerk Dashboard

## Most Likely Issue

**99% of the time it's one of these:**
1. Using test keys (`pk_test_`) instead of live keys (`pk_live_`)
2. Keys from wrong Clerk application/instance
3. Environment variables not set in deployment platform
4. Domain not added to Production instance in Clerk

## Still Not Working?

1. **Double-check**: Are you 100% sure you're using Production instance keys?
2. **Verify**: Do the keys in deployment platform match Clerk Dashboard exactly?
3. **Test**: Try creating a new production instance in Clerk and use those keys
4. **Check logs**: Look at deployment logs for any Clerk-related errors

