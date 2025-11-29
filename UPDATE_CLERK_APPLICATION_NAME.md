# How to Update Clerk Application Name

The application name shown in Clerk's sign-in form ("Sign in to Sahil_Goel_Portfolio") comes from your Clerk Dashboard settings, not from your code.

## Steps to Update Application Name in Clerk Dashboard

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com/
   - Sign in to your account

2. **Select Your Application**
   - Choose the application that matches your current keys

3. **Go to Branding Settings**
   - Click on **"Branding"** in the left sidebar
   - Or go to **"Settings"** → **"Branding"**

4. **Update Application Name**
   - Find the **"Application Name"** field
   - Change it from "Sahil_Goel_Portfolio" to **"RKG Properties & Constructions"**
   - Click **"Save"**

5. **Update Logo (Optional)**
   - You can also upload a logo for your application
   - This will appear in the sign-in/sign-up forms

6. **Clear Browser Cache**
   - After updating, clear your browser cache
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

## Alternative: Update via Clerk Dashboard URL

Direct link to branding settings:
```
https://dashboard.clerk.com/apps/[YOUR_APP_ID]/branding
```

Replace `[YOUR_APP_ID]` with your actual Clerk application ID.

## What I've Updated in Code

I've also updated the code to:
- ✅ Match your brand colors (golden color `#c99700`)
- ✅ Customize button styles
- ✅ Ensure consistent appearance across all sign-in/sign-up pages

However, the **application name** must be changed in the Clerk Dashboard for it to appear correctly.

## After Updating

1. **Restart your dev server** (if running)
2. **Clear browser cache**
3. **Try signing in again**

The sign-in form should now show "Sign in to RKG Properties & Constructions" instead of the old name.

---

**Note**: If you're using a different Clerk application (new keys), make sure you're updating the correct application in the dashboard that matches your current environment variables.

