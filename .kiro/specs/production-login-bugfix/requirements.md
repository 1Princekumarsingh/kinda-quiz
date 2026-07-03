# Production Login Failure - Requirements

## Problem Statement
Users cannot login in production (Vercel frontend + Render backend + Neon database). The application works locally but fails when deployed across separate domains.

## Root Cause Analysis
1. **CORS Misconfiguration**: Backend only allows `localhost` origins, blocks Vercel requests
2. **API URL Routing**: Frontend defaults to `/api` (local proxy), doesn't reach Render backend
3. **Missing Environment Variables**: Backend not configured with production domains
4. **Insecure Cookie Settings**: `COOKIE_SECURE=False` incompatible with HTTPS
5. **Hardcoded Configuration**: Backend uses hardcoded CORS instead of environment-based config

## Affected Flows
- User clicks "Login" on Vercel frontend
- POST request to `/api/auth/login` is attempted
- **Failure Point 1**: CORS blocks cross-origin request (if API URL is correct)
- **Failure Point 2**: API request never reaches backend (if using local `/api` proxy)
- **Result**: Login page shows network/CORS error or times out

## Success Criteria
1. ✅ Frontend (Vercel) can make authenticated API calls to Backend (Render)
2. ✅ Login endpoint accessible and functional
3. ✅ CORS headers properly configured for production domains
4. ✅ Environment variables configurable per deployment platform
5. ✅ HTTPS/secure cookie settings enabled
6. ✅ No hardcoded localhost references in production code

## Implementation Scope
- Modify backend CORS middleware to use environment-based configuration
- Update backend config to read `BACKEND_CORS_ORIGINS` from environment
- Update frontend axios to properly resolve API URL in production
- Ensure environment variables can be set on Render and Vercel
- Document deployment configuration for each platform
- Test production login flow end-to-end
