# Production Login Bugfix - Tasks

## Overview
Fix production login failures by configuring CORS for cross-domain requests, properly setting API URLs, and securing cookie settings for HTTPS production environment.

## Tasks

- [x] 1. Update backend config to use environment-based CORS
  - Read backend/app/core/config.py
  - Ensure BACKEND_CORS_ORIGINS is read from environment variable
  - Verify parsing of comma-separated origins
  - Set sensible defaults for local development
  - Add environment variables for secure cookies (COOKIE_SECURE, COOKIE_SAMESITE)
  - Verify Settings class properly loads from .env file

- [x] 2. Update backend CORS middleware
  - Replace hardcoded allow_origins in backend/app/main.py
  - Use get_settings().cors_origins instead of hardcoded list
  - Ensure security settings (secure cookies, same-site policy) are applied
  - Test that middleware properly reads configuration

- [x] 3. Verify frontend API URL configuration
  - Confirm frontend/src/lib/axios.ts uses VITE_API_URL environment variable correctly
  - Verify it defaults to /api for local development (for vite proxy)
  - Confirm VITE_API_URL can be set during build
  - No code changes needed if already correct

- [x] 4. Create backend deployment instructions
  - Create DEPLOYMENT.md in project root
  - Document Render backend setup
  - List all required environment variables for backend
  - Include values for BACKEND_CORS_ORIGINS with Vercel domain
  - Document how to set environment variables on Render
  - Add troubleshooting section for CORS errors

- [x] 5. Create frontend deployment instructions
  - Add to DEPLOYMENT.md
  - Document Vercel frontend setup
  - List all required environment variables for frontend
  - Include VITE_API_URL pointing to Render backend
  - Document how to set environment variables on Vercel
  - Verify build process injects VITE_API_URL correctly

- [ ] 6. Test production login flow
  - Deploy backend changes to Render (or staging)
  - Deploy frontend changes to Vercel (or staging)
  - Set BACKEND_CORS_ORIGINS to include Vercel production domain
  - Set VITE_API_URL to Render backend URL
  - Test login endpoint: POST /api/auth/login
  - Verify CORS headers in response
  - Test complete login flow (username entry, auth success, dashboard)
  - Verify no console errors in browser developer tools
  - Check response headers for proper CORS configuration

- [ ] 7. Test other authenticated endpoints
  - Test GET /api/subjects (list subjects)
  - Test POST /api/subjects (create subject)
  - Verify all endpoints respond with proper CORS headers
  - Test quiz operations (if available)

- [ ] 8. Document environment variables for all platforms
  - Update backend/.env.example with production values
  - Update frontend/.env.example (if exists) or document VITE_ variables
  - Include comments explaining each variable
  - Document secrets management best practices
  - Include copy-paste templates for each platform

- [ ] 9. Verify local development still works
  - Test backend locally with venv
  - Test frontend locally with npm dev
  - Verify vite proxy correctly routes to localhost:8000
  - Test login flow locally
  - Confirm no breaking changes to local workflow

## Task Dependency Graph

```
1. Update backend config
   ↓
2. Update backend CORS middleware
   ↓
6. Test production login flow (CRITICAL PATH)
   ↓
7. Test other authenticated endpoints
   ↓
9. Verify local development still works

3. Verify frontend API URL (independent, likely no changes needed)
   ↓
(3, 5) → 6. Test production login flow

4. Create backend deployment instructions (parallel)
5. Create frontend deployment instructions (parallel)
   ↓
8. Document environment variables

(7, 8, 9) → COMPLETE
```

## Acceptance Criteria

- ✅ Backend CORS configured via environment variables
- ✅ CORS allows Vercel production domain
- ✅ Frontend API URL correctly routes to Render backend
- ✅ Production login endpoint accessible and working
- ✅ Cookies configured as secure and HTTPS-compatible
- ✅ No CORS errors in browser console
- ✅ Complete authentication flow works end-to-end
- ✅ Local development continues to work without changes
- ✅ Deployment instructions clear and complete
- ✅ All environment variables documented

## Notes

**Production URLs** (update with actual values):
- Frontend: `https://kinda-quiz.vercel.app` (Vercel)
- Backend: `https://kinda-quiz-api.onrender.com` (Render)

**Required Environment Variables**:

Backend (Render):
```
DATABASE_URL=postgresql://neondb_owner:...@ep-wispy-mud-aoo2dy9y.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
SECRET_KEY=<generated>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
BACKEND_CORS_ORIGINS=https://kinda-quiz.vercel.app,http://localhost:5173,http://localhost
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
```

Frontend (Vercel):
```
VITE_API_URL=https://kinda-quiz-api.onrender.com
```

**Testing CORS Issues**:
Open browser DevTools → Network tab → Look for login request:
- If CORS error: Origin not in BACKEND_CORS_ORIGINS
- If timeout: VITE_API_URL not set correctly
- If 401/403: Auth issue (not CORS-related)

**Time Estimate**: 1-2 hours total
