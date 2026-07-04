# Safari Cookie Fix - Cross-Origin Authentication

## Problem
Safari is blocking authentication cookies because your frontend (Vercel) and backend (Render) are on different domains. Safari requires special cookie settings for cross-origin authentication.

## ✅ Backend Configuration (Already Set)

Your backend already has the correct settings:
```bash
COOKIE_SECURE=True
COOKIE_SAMESITE=none
BACKEND_CORS_ORIGINS=https://kinda-quiz.vercel.app
```

## Safari Troubleshooting Steps

### Step 1: Check Vercel Environment Variable

**Important:** Verify that Vercel has the backend API URL configured:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `VITE_API_URL` is set to your Render backend URL
3. Example: `VITE_API_URL=https://your-backend.onrender.com`

**If missing, add it and redeploy the frontend.**

### Step 2: Clear Safari Data

1. Safari → Settings → Privacy
2. Click "Manage Website Data"
3. Search for "kinda-quiz" and "render.com"
4. Remove all related data
5. Close and reopen Safari

### Step 3: Disable "Prevent Cross-Site Tracking" (Temporary Test)

**For testing only:**
1. Safari → Settings → Privacy
2. **Uncheck** "Prevent cross-site tracking"
3. Try logging in again
4. If it works, this confirms Safari's tracking prevention is the issue

### Step 4: Check Browser Console

1. Open Safari on the login page
2. Right-click → Inspect Element → Console tab
3. Try logging in
4. Look for errors related to:
   - CORS
   - Cookie blocked
   - Network errors
5. Share any error messages you see

### Step 5: Test Cookie Response Headers

Open Safari Developer Tools (Console tab) and run:

```javascript
// After trying to login, check if cookies are set
document.cookie
```

If empty or no auth cookie, the backend isn't setting cookies properly.

## Why This Happens

- **Same-Origin:** Frontend and backend on same domain (e.g., example.com/app and example.com/api) → `SameSite=lax` works
- **Cross-Origin:** Frontend and backend on different domains (e.g., app.vercel.app and api.render.com) → Requires `SameSite=none`

Safari is more strict about cross-origin cookies than Chrome/Firefox, so it fails first.

## Current Settings vs Required Settings

### Current (doesn't work in Safari):
```bash
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
```

### Required (works in Safari):
```bash
COOKIE_SECURE=true
COOKIE_SAMESITE=none
```

## After Fix

Once you update these environment variables in Render and redeploy, Safari will accept the authentication cookies and login will work properly!


## Alternative Solution: Use Same Domain

If Safari tracking prevention continues to block cookies, consider one of these approaches:

### Option A: Proxy Backend Through Vercel (Recommended)

Configure Vercel to proxy `/api` requests to your Render backend:

1. Update `vercel.json` in frontend:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.onrender.com/api/:path*"
    }
  ]
}
```

2. Update frontend axios to use relative path:
```typescript
// frontend/src/lib/axios.ts
const api = axios.create({
  baseURL: '/api',  // Changed from absolute URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})
```

3. Update backend CORS:
```bash
# Backend .env - No longer need cross-origin since proxied
COOKIE_SAMESITE=lax
BACKEND_CORS_ORIGINS=https://kinda-quiz.vercel.app
```

4. Redeploy both frontend and backend

**Benefits:**
- Frontend and backend appear to be on same domain (kinda-quiz.vercel.app)
- Safari won't block cookies
- Works with "Prevent Cross-Site Tracking" enabled

### Option B: Custom Domain with Subdomains

1. Get a domain (e.g., `recallx.com`)
2. Frontend: `app.recallx.com` (Vercel)
3. Backend: `api.recallx.com` (Render)
4. Both are same-site, so `SameSite=lax` works
5. Safari won't block cookies

## Most Likely Issue

**Check Vercel environment variables!** If `VITE_API_URL` is not set in Vercel, your frontend might be trying to call `/api` locally instead of your Render backend, which would fail.

Run this in Vercel:
1. Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://your-backend.onrender.com`
3. Redeploy frontend

## Debug Commands

Check if the backend URL is correct in production:

```javascript
// In Safari console on kinda-quiz.vercel.app
console.log(import.meta.env.VITE_API_URL)
// Should show your Render backend URL
```

Check network requests:
1. Safari → Develop → Show Web Inspector → Network
2. Try logging in
3. Look for the `/api/auth/login` request
4. Check if it's going to the right backend URL
5. Check response headers for `Set-Cookie`
