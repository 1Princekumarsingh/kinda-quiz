# Production Login Fix - Design

## Architecture Changes

### Backend (Render)
**Current State:**
```python
# backend/app/main.py - HARDCODED
allow_origins=["http://localhost:5173", "http://localhost"]
```

**Design Solution:**
1. Update `backend/app/core/config.py` to properly load `BACKEND_CORS_ORIGINS` from environment
2. Modify `backend/app/main.py` to use `get_settings().cors_origins` for CORS configuration
3. Add environment variables for production:
   - `BACKEND_CORS_ORIGINS`: Comma-separated list of allowed origins
   - `COOKIE_SECURE`: Boolean to enable secure cookies (True in production)
   - `COOKIE_SAMESITE`: SameSite cookie policy

**Deployment:**
- Render: Set environment variables in dashboard
- Docker/compose: Can be passed via `.env` file

### Frontend (Vercel)
**Current State:**
```typescript
// frontend/src/lib/axios.ts
baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
```

**Design Solution:**
1. Frontend code remains unchanged (already supports `VITE_API_URL`)
2. Set `VITE_API_URL` build environment variable on Vercel
3. Format: `https://your-backend.onrender.com` (without `/api` suffix)
4. Build process will inject this at compile time

**Deployment:**
- Vercel: Set `VITE_API_URL` in Environment Variables section
- Local dev: Use `/api` proxy via vite.config.ts (unchanged)

### Configuration Structure
```
backend/app/core/config.py
├── Read BACKEND_CORS_ORIGINS from environment (comma-separated)
├── Parse into list of origins
├── Default to localhost for development
└── Apply security settings (COOKIE_SECURE, COOKIE_SAMESITE)

backend/app/main.py
├── Import Settings via get_settings()
├── Use settings.cors_origins for CORSMiddleware
└── Apply cookie security settings from config
```

## Flow Diagram (Production)

```
User (Vercel Frontend)
  ↓
https://app.vercel.com
  ↓
  POST /api/auth/login
  (axios with VITE_API_URL=https://backend.onrender.com)
  ↓
https://backend.onrender.com/api/auth/login
  ↓
Backend Receives Request
  Check Origin: https://app.vercel.com
  ✓ In BACKEND_CORS_ORIGINS? YES
  ✓ Set CORS headers in response
  ↓
Browser Receives Response
  ✓ Origin allowed
  ✓ Accept response
  ↓
Login Success
```

## Environment Variable Mapping

### Render Backend
```
DATABASE_URL=postgresql://neondb_owner:...@ep-wispy-mud-aoo2dy9y.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
SECRET_KEY=<generated-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost,https://kinda-quiz.vercel.app
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
```

### Vercel Frontend
```
VITE_API_URL=https://kinda-quiz-api.onrender.com
```

## Implementation Details

### Task 1: Update Backend Config
- Modify `backend/app/core/config.py` to ensure `BACKEND_CORS_ORIGINS` is read from environment
- Add proper parsing of comma-separated values
- Set defaults for local development

### Task 2: Update Backend CORS Middleware
- Replace hardcoded list in `backend/app/main.py` with `get_settings().cors_origins`
- Ensure settings are properly instantiated

### Task 3: Configure Cookie Settings
- Set `COOKIE_SECURE=True` for production HTTPS
- Update security settings in config

### Task 4: Document Deployment
- Create deployment guide for Render (backend)
- Create deployment guide for Vercel (frontend)
- Document environment variables for each platform
- Include troubleshooting CORS issues

### Task 5: Verify Production Flow
- Test login endpoint with production URLs
- Verify CORS headers present in response
- Test full authentication flow

## Backward Compatibility
- Local development continues to work with defaults
- Docker Compose continues to work with `/api` proxy in nginx
- Existing `.env` files remain compatible
