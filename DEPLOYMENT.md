# Deployment Guide for Kinda Quiz

This guide covers deploying both the backend and frontend of the Kinda Quiz application.

---

## Frontend Deployment (Vercel)

Vercel is the recommended platform for deploying the Kinda Quiz frontend. It provides seamless integration with GitHub, automatic deployments on push, and excellent performance for Vite-based applications.

### Prerequisites

Before deploying to Vercel, ensure you have:

- **Node.js 18+** installed locally
- **npm or yarn** package manager
- A **GitHub account** with the repository pushed
- A **Vercel account** (free tier available at https://vercel.com)

### Step 1: Prepare Your Repository

Ensure your frontend code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Connect Your GitHub Repository to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"New Project"** or **"Add New"** → **"Project"**
3. Select **"Import Git Repository"**
4. Search for and select your GitHub repository (e.g., `kinda-quiz`)
5. Click **"Import"**

### Step 3: Configure Build Settings

Vercel should auto-detect your Vite configuration, but verify these settings:

- **Framework Preset**: Select **"Vite"** (or let Vercel auto-detect)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` (or `yarn install`)

If Vercel doesn't auto-detect, manually set these values in the project settings.

### Step 4: Set Environment Variables

Environment variables are crucial for connecting your frontend to the backend API.

**On the Vercel Dashboard:**

1. Go to your project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variable:

| Variable Name | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://kinda-quiz-api.onrender.com` | Points to the production backend on Render |

4. Click **"Save"**

**Important:** Environment variables prefixed with `VITE_` are injected at build time by Vite. They are baked into the compiled JavaScript bundle and available as `import.meta.env.VITE_API_URL` in your frontend code.

### Step 5: Deploy

Once configured, Vercel automatically deploys when you push to your main branch:

1. Make changes to your code and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. Vercel automatically builds and deploys your changes
3. Monitor the deployment in the **Deployments** tab on your Vercel dashboard

For immediate deployment without waiting for a GitHub push, you can manually trigger a redeployment:
- Go to your project on Vercel
- Click **"Redeploy"** next to the current deployment

### Step 6: Verify Your Deployment

After deployment completes, verify everything works:

1. **Visit Your Deployed Site**
   - Find your deployment URL on the Vercel dashboard (usually `https://your-project-name.vercel.app`)
   - Open it in your browser

2. **Test the Login Flow**
   - Navigate to the login page
   - Enter test credentials and attempt to log in
   - If login succeeds, your frontend is correctly connected to the production backend

3. **Check the Network Tab**
   - Open Developer Tools (F12 or Cmd+Shift+I)
   - Go to the **Network** tab
   - Log in again and observe API requests to `https://kinda-quiz-api.onrender.com`
   - Verify requests complete successfully (status 200-299)

### Step 7: View Logs and Analytics

**To troubleshoot or monitor your deployment:**

1. **Deployment Logs**
   - In Vercel Dashboard, click **"Deployments"**
   - Select a deployment to view build logs and any errors

2. **Runtime Logs**
   - Click **"Functions"** to view edge function logs
   - Use **"Analytics"** to monitor traffic and performance

3. **Environment Variables Verification**
   - In Settings → Environment Variables, you can see which variables are set
   - To verify they're correctly injected, check the **Deployments** → **Build Logs**

### Troubleshooting

#### CORS Errors

If you see CORS errors in the browser console:

1. **Check the Browser Console**
   - Open Developer Tools (F12)
   - Look for errors like: `Access to XMLHttpRequest blocked by CORS policy`

2. **Verify VITE_API_URL**
   - On Vercel dashboard, go to Settings → Environment Variables
   - Confirm `VITE_API_URL` is set to `https://kinda-quiz-api.onrender.com`
   - Redeploy your site if you made changes: Click **"Redeploy"** on the latest deployment

3. **Check Backend CORS Configuration**
   - Ensure the backend allows requests from your Vercel deployment URL
   - The backend should have CORS middleware configured to accept your frontend domain

4. **Test the API Directly**
   - Open a new browser tab and visit: `https://kinda-quiz-api.onrender.com/health`
   - If you see JSON response, the backend is running
   - If you get an error, the backend may be down or unreachable

#### Deployment Fails

If the build fails during deployment:

1. Check the **Build Logs** in Vercel Dashboard
2. Look for errors related to:
   - Missing dependencies: Run `npm install` locally and verify `package.json`
   - Build errors: Run `npm run build` locally to reproduce
   - Environment variables: Ensure all required `VITE_*` variables are set

3. Fix issues locally, commit, and push to GitHub
4. Vercel will automatically retry the deployment

#### Blank Page or 404

If your deployed site shows a blank page or 404:

1. Verify the **Output Directory** is set to `dist` in Vercel settings
2. Check that `npm run build` successfully creates the `dist` folder locally
3. Review build logs for any JavaScript errors
4. Clear browser cache (Ctrl+Shift+Delete) and reload

### Customizing Your Domain

By default, Vercel gives your project a URL like `https://project-name.vercel.app`. To use a custom domain:

1. Go to your project settings
2. Navigate to **Domains**
3. Enter your custom domain (e.g., `quiz.example.com`)
4. Follow Vercel's instructions to update your DNS records
5. Vercel will provision an SSL certificate automatically

### Environment Variables Reference

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_URL` | Backend API endpoint | `https://kinda-quiz-api.onrender.com` |

Add additional `VITE_*` variables as needed for your application (they'll be injected at build time).

### Performance Tips

- **Automatic Optimization**: Vercel automatically optimizes images and bundles
- **Edge Caching**: Static assets are cached globally on Vercel's CDN
- **Analytics**: Monitor Core Web Vitals in the Vercel Dashboard
- **Incremental Static Regeneration**: If using SSR, configure ISR for better performance

---

## Backend Deployment (Render)

Render is the recommended platform for deploying the Kinda Quiz backend. It provides simple Docker container deployment, automatic PostgreSQL database connections via Neon, and seamless integration with GitHub.

### Prerequisites

Before deploying to Render, ensure you have:

- **Python 3.12+** installed locally
- **PostgreSQL knowledge** - understanding of database connection strings and SSL modes
- A **GitHub account** with the repository pushed
- A **Render account** (free tier available at https://render.com)
- A **Neon account** for managed PostgreSQL (free tier at https://neon.tech)

### Architecture Overview

The Kinda Quiz backend uses:
- **FastAPI** web framework with Uvicorn ASGI server
- **PostgreSQL** database (via Neon for managed hosting)
- **SQLAlchemy** ORM with Alembic migrations
- **JWT** authentication with secure token signing
- **CORS middleware** for frontend communication

### Step 1: Set Up a PostgreSQL Database (Neon)

Render can use any PostgreSQL database. We recommend Neon for its free tier and ease of use.

**Create a Neon Database:**

1. Go to [https://neon.tech](https://neon.tech) and sign up
2. Create a new project:
   - Click **"New Project"**
   - Name it `kinda-quiz-prod` or similar
   - Select your preferred region (closest to your expected users)
3. Once created, you'll see the **Connection String** on the dashboard
4. Copy the connection string (looks like: `postgresql://neondb_owner:PASSWORD@ep-xxxxx.region.aws.neon.tech/recallx?sslmode=require`)
5. Save this for later - you'll need it when configuring Render

**Important Notes:**
- Neon automatically includes SSL mode (`sslmode=require`) in the connection string
- Free tier is limited to ~10GB storage, but suitable for development/testing
- Keep your connection string secret - treat it like a password

### Step 2: Prepare Your Backend Repository

Ensure your backend code is committed and pushed to GitHub:

```bash
# From the project root
cd backend
git add .
git commit -m "Prepare backend for Render deployment"
cd ..
git push origin main
```

Verify the Dockerfile and requirements.txt are in the `backend/` directory.

### Step 3: Create a Render Web Service

1. Go to [https://render.com/dashboard](https://render.com/dashboard) and sign in
2. Click **"New"** → **"Web Service"**
3. Select **"Build and deploy from a Git repository"**
4. Click **"Connect"** next to your GitHub repository
5. Search for `kinda-quiz` and click **"Connect"**

### Step 4: Configure Render Service Settings

After connecting your repository, configure these settings:

| Setting | Value | Notes |
|---------|-------|-------|
| **Name** | `kinda-quiz-api` | Your service name (will be in the URL) |
| **Region** | Choose closest to users | e.g., Oregon (US West), Ohio (US East), Frankfurt (Europe) |
| **Branch** | `main` | Deploy from main branch |
| **Runtime** | `Docker` | Use Dockerfile for deployment |
| **Build Command** | (leave empty) | Render auto-detects from Dockerfile |
| **Start Command** | (leave empty) | Render uses CMD from Dockerfile |

**Important:** Ensure **"Auto-Deploy"** is enabled so changes to main branch deploy automatically.

### Step 5: Set Environment Variables on Render

Environment variables on Render are set in the service dashboard, not in a .env file (which should never be committed).

**On the Render Dashboard:**

1. Go to your web service dashboard (e.g., `kinda-quiz-api`)
2. Click **"Environment"** in the left sidebar
3. Add the following environment variables:

| Variable | Value | Generation/Notes |
|----------|-------|------------------|
| `DATABASE_URL` | `postgresql://neondb_owner:PASSWORD@ep-xxxxx.region.aws.neon.tech/recallx?sslmode=require` | Copy from Neon dashboard; includes your actual Neon credentials |
| `SECRET_KEY` | (Generate a new one) | Generate with: `python -c "import secrets; print(secrets.token_hex(32))"` - must be unique for production |
| `ALGORITHM` | `HS256` | JWT signing algorithm - do not change |
| `ACCESS_TOKEN_EXPIRE_DAYS` | `7` | Token expiration in days (1 week standard) |
| `BACKEND_CORS_ORIGINS` | `https://kinda-quiz.vercel.app,http://localhost:5173,http://localhost` | Frontend URL (Vercel) + local development URLs; separated by commas, no spaces |
| `COOKIE_SECURE` | `true` | Production security setting - ensures cookies only sent over HTTPS |
| `COOKIE_SAMESITE` | `lax` | SameSite cookie policy - prevents CSRF attacks |

**Detailed Configuration:**

- **DATABASE_URL**: Get this from your Neon dashboard. Example: `postgresql://neondb_owner:abc123def456@ep-cool-sound-123456.us-east-4.aws.neon.tech/recallx?sslmode=require`
  - Format: `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?sslmode=require`
  - Neon provides the entire connection string - just copy it

- **SECRET_KEY**: Generate a strong random key:
  ```bash
  # Option 1: Python
  python -c "import secrets; print(secrets.token_hex(32))"
  
  # Option 2: OpenSSL
  openssl rand -hex 32
  
  # Option 3: Online tool
  # https://generate-secret.vercel.app/32
  ```
  - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
  - **This must be different for production** - never use the same key across environments

- **BACKEND_CORS_ORIGINS**: 
  - Include your Vercel URL: `https://kinda-quiz.vercel.app`
  - Include development URLs: `http://localhost:5173,http://localhost`
  - Format: comma-separated, no spaces: `https://app.com,http://localhost:5173,http://localhost`

### Step 6: Connect PostgreSQL/Neon Database

The `DATABASE_URL` environment variable automatically configures database connectivity. However, you may need to run database migrations.

**Option A: Run Migrations on First Deploy (Recommended)**

Add a pre-deploy hook in Render to run migrations:

1. On your Render service dashboard, go to **"Settings"** → **"Build & Deploy"**
2. Scroll down to **"Pre-deployment Command"**
3. Enter: `cd backend && alembic upgrade head`
4. Save and redeploy

This runs Alembic migrations before starting the service, ensuring your database schema is up-to-date.

**Option B: Run Migrations Manually**

If the pre-deploy hook isn't available or fails:

1. Create a temporary Render service with shell access
2. Connect via SSH and run: `alembic upgrade head`
3. Verify schema created: `\dt` in psql

### Step 7: Deploy the Backend

Once you've configured all settings:

1. Click **"Deploy"** on the Render dashboard
2. Monitor the deployment in the **"Logs"** section:
   - Look for "Build started"
   - Watch for build completion: "Successfully built Docker image"
   - Service should start with "Uvicorn running on 0.0.0.0:8000"
3. Deployment typically takes 2-5 minutes

Render automatically redeployed when you push to your main branch (if auto-deploy is enabled).

### Step 8: Verify Backend Deployment

Test your deployed backend with these verification steps:

**1. Check Service Health**

Visit the health check endpoint in your browser:

```
https://kinda-quiz-api.onrender.com/health
```

You should see:
```json
{"status": "healthy"}
```

If you see "404 Not Found", the service may still be starting - wait a moment and refresh.

**2. Check Database Connection**

The API will fail to start if the database connection is invalid. Check the Render logs:

1. Go to **"Logs"** on your Render service dashboard
2. Look for any errors like:
   - `OperationalError`: Database connection failed - verify `DATABASE_URL`
   - `psycopg2.OperationalError`: SSL certificate error - ensure `sslmode=require` in connection string
   - `NoSuchModuleError`: Python dependency missing - verify requirements.txt

**3. Test a Simple API Request**

Using curl or Postman, test the root endpoint:

```bash
curl https://kinda-quiz-api.onrender.com/
```

Expected response:
```json
{"message": "RecallX API"}
```

**4. Test Frontend Connection**

From your deployed frontend at `https://kinda-quiz.vercel.app`:

1. Open Developer Tools (F12)
2. Go to the **"Network"** tab
3. Attempt to log in
4. Observe requests going to `https://kinda-quiz-api.onrender.com`
5. API requests should return 200-299 status codes

If requests fail, see **Troubleshooting CORS Issues** below.

### Troubleshooting

#### CORS Issues ("Access-Control-Allow-Origin" errors)

CORS errors appear in the browser console but the API logs show success.

**Diagnosis:**

1. **Check Frontend Console**
   - Open Developer Tools (F12) → **"Console"** tab
   - Look for error: `Access to XMLHttpRequest at 'https://kinda-quiz-api.onrender.com/...' from origin 'https://kinda-quiz.vercel.app' has been blocked by CORS policy`

2. **Verify Backend CORS Configuration**
   - Go to your Render service dashboard
   - Click **"Environment"**
   - Confirm `BACKEND_CORS_ORIGINS` includes your frontend domain exactly as it appears in the browser (including protocol)

**Solution:**

1. Update `BACKEND_CORS_ORIGINS` on Render dashboard:
   - Example for Vercel: `https://kinda-quiz.vercel.app,http://localhost:5173,http://localhost`
   - No trailing slashes
   - No spaces after commas
   - Must include protocol (`https://`)

2. After updating, click **"Redeploy"** to apply changes

3. **Important for Vercel:** If you later change your Vercel domain, you must update this variable and redeploy the backend

#### Database Connection Errors

Error: `OperationalError` or `could not connect to server`

**Solution:**

1. Verify `DATABASE_URL` in Render environment variables:
   ```
   postgresql://neondb_owner:PASSWORD@ep-xxxxx.region.aws.neon.tech/DATABASE?sslmode=require
   ```

2. Ensure the Neon connection string includes:
   - `sslmode=require` - required for Neon SSL connections
   - Correct password - special characters must not be URL-encoded in Render dashboard

3. If password contains special characters, test locally first:
   ```bash
   psql "DATABASE_URL"
   ```

4. Check Neon dashboard to verify database still exists and is not suspended

5. Click **"Redeploy"** on Render after fixing

#### Deployment Fails ("Failed to pull image" or Docker build error)

**Solution:**

1. Check **"Logs"** on Render dashboard for specific error
2. Verify `backend/Dockerfile` exists in your repository
3. Verify `backend/requirements.txt` has all dependencies
4. Run locally to test: `docker build -t kinda-quiz backend/`
5. If local build fails, fix issues locally, commit, and push - Render will retry

#### Service Takes Long Time to Deploy

Render services may spin down after inactivity on free tier. First request after startup takes 30-60 seconds.

**Solution:**

1. For faster performance, upgrade to a paid plan
2. Or: Set up a periodic health check service to keep service running
3. Check Render dashboard for service status

#### SSL Certificate Errors ("certificate verify failed")

Error in logs: `ssl.SSLError: certificate verify failed`

**Solution:**

This typically means the `sslmode=require` parameter is present but Neon's certificate isn't being verified. This is expected in some environments.

1. Verify `DATABASE_URL` has: `sslmode=require`
2. If error persists, try: `sslmode=allow` (less secure, but may work as temporary fix)
3. Recommended: Update Neon password to contain only alphanumeric characters to avoid encoding issues

### How to View Logs

Monitor your backend deployment via Render logs:

**Real-time Logs:**
1. Go to your Render service dashboard
2. Click **"Logs"** tab at top
3. See live application output
4. Useful for debugging deployment issues

**Types of Log Messages:**

- `Build started`: Render is building your Docker image
- `Successfully built Docker image`: Build succeeded
- `Pulling from Docker...`: Starting container
- `Uvicorn running on 0.0.0.0:8000`: Service started successfully
- `OperationalError`: Database connection failed
- `ERROR: could not connect to...`: Network/database issue
- `WARNING: Invalid CORS origin`: Frontend URL not in `BACKEND_CORS_ORIGINS`

### Environment Variables Reference

**Production Values:**

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:pass123@ep-cool-sound-12345.us-east-4.aws.neon.tech/recallx?sslmode=require` | From Neon dashboard; includes authentication and SSL |
| `SECRET_KEY` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` | Generate new for production - never reuse |
| `ALGORITHM` | `HS256` | Standard JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_DAYS` | `7` | Customize as needed (7 days typical) |
| `BACKEND_CORS_ORIGINS` | `https://kinda-quiz.vercel.app,http://localhost:5173,http://localhost` | Include all frontend domains (production + dev) |
| `COOKIE_SECURE` | `true` | Required for production HTTPS |
| `COOKIE_SAMESITE` | `lax` | Prevents CSRF attacks |

### Database Backups

Neon provides automated backups on free tier. To export data:

1. Go to your Neon project dashboard
2. Click **"Backups"** section
3. Download backup or use Neon's restore features
4. For manual backup: `pg_dump DATABASE_URL > backup.sql`

### Performance Tips

- **Enable Render Pro**: Free tier has 15-minute inactivity timeout; Pro tier runs 24/7
- **Use Connection Pooling**: Neon provides built-in pooling at `pool.neon.tech` endpoint (advanced)
- **Monitor API Usage**: Check Render dashboard for error rates and response times
- **Cache Responses**: FastAPI supports caching headers for static content
- **Optimize Database Queries**: Use Render logs to identify slow queries

### Next Steps

1. ✅ Configure database (Neon)
2. ✅ Deploy to Render
3. ✅ Set environment variables
4. ✅ Verify health check
5. Next: Connect frontend by setting `VITE_API_URL` on Vercel to `https://kinda-quiz-api.onrender.com`
6. Test end-to-end: Login → Take quiz → Verify API calls in Network tab
7. Monitor logs regularly for errors
