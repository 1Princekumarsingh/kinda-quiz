# Keep Render Backend Awake 24/7 (Free Solution)

## Problem
Render free tier spins down your backend after 15 minutes of inactivity, causing 50+ second delays on first request.

## Solution: UptimeRobot (Free Forever)

UptimeRobot will ping your backend every 5 minutes to keep it awake 24/7.

## Setup Steps (5 minutes)

### Step 1: Get Your Backend URL
Your Render backend URL should be something like:
```
https://your-app-name.onrender.com
```

Find it in Render Dashboard → Your Service → Settings

### Step 2: Create UptimeRobot Account
1. Go to https://uptimerobot.com
2. Click "Sign Up Free"
3. Create account with your email
4. Verify your email

### Step 3: Create Monitor
1. After logging in, click **"+ Add New Monitor"**
2. Fill in the form:

   **Monitor Type:** `HTTP(s)`
   
   **Friendly Name:** `Kinda-Quiz Backend`
   
   **URL (or IP):** Your Render backend URL + `/api/health` endpoint
   ```
   https://your-app-name.onrender.com/api/health
   ```
   
   **Monitoring Interval:** `5 minutes` (shortest free interval)
   
3. Click **"Create Monitor"**

### Step 4: Verify It's Working
1. Monitor will show as "Up" once it successfully pings your backend
2. Your backend will stay awake as long as UptimeRobot keeps pinging it
3. Check status at: https://uptimerobot.com/dashboard

## Create Health Check Endpoint (If Missing)

If your backend doesn't have `/api/health`, add it:

### Backend: `backend/app/api/health.py`
```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint for uptime monitoring"""
    return {"status": "healthy"}
```

### Backend: `backend/app/main.py`
Add the health router:
```python
from app.api import health

# Include health check router
app.include_router(health.router, prefix="/api", tags=["health"])
```

Commit and push the changes, wait for Render to deploy.

## Alternative: Cron-Job.org (Also Free)

If you prefer Cron-Job.org instead:

1. Go to https://cron-job.org
2. Sign up (free)
3. Create new cronjob:
   - Title: `Keep Backend Awake`
   - URL: `https://your-app-name.onrender.com/api/health`
   - Schedule: Every 5 minutes
4. Save and enable

## Test It Works

1. Wait 20+ minutes for your backend to normally spin down
2. Check if backend is still responding quickly
3. If it responds in <2 seconds, UptimeRobot is working! ✅
4. If it takes 50+ seconds, check your monitor URL is correct

## Free Tier Limits

**UptimeRobot Free:**
- 50 monitors
- 5-minute intervals
- More than enough for this use case!

**Cron-Job.org Free:**
- 1-minute intervals available
- More flexible scheduling

## Benefits

✅ Backend stays awake 24/7
✅ Fast login on Safari and all browsers
✅ No more 50-second delays
✅ Free forever
✅ No code changes needed
✅ Email alerts if backend goes down

## Note

Your backend will use more resources staying awake, but Render free tier has enough hours per month (750 hours) to run continuously.
