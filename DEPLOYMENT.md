# PharmaGuard Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Post-Deployment Checklist](#post-deployment-checklist)
5. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
6. [Production Best Practices](#production-best-practices)

---

## Prerequisites

### Required
- GitHub account (repository hosting)
- OpenAI API key (optional but recommended for AI explanations)
- Account on one of these platforms:
  - **Backend:** Render, Heroku, AWS, Railway, DigitalOcean
  - **Frontend:** Vercel, Netlify, AWS, GitHub Pages

### Recommended
- Custom domain name
- SSL certificate (auto-provisioned by most platforms)
- Email for notifications/alerts

---

## Backend Deployment

### Option 1: Deploy to Render (Recommended)

Render is free tier friendly, supports Python/FastAPI, and easy to set up.

#### Step 1: Prepare Repository
```bash
# From root directory
git init
git add .
git commit -m "Initial PharmaGuard deployment"
git branch -M main
git remote add origin https://github.com/yourname/PharmaGuard.git
git push -u origin main
```

#### Step 2: Create Render Web Service
1. Go to https://render.com (create free account)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub (authorize if needed)
4. Select your PharmaGuard repository
5. Configure:
   - **Name:** `pharmaguard-backend`
   - **Environment:** `Python 3.11`
   - **Build Command:** 
     ```bash
     cd backend && pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
     ```
   - **Branch:** `main`
   - **Plan:** Free (for testing) or Starter+ (production)

#### Step 3: Add Environment Variables
1. In Render dashboard, go to **Environment** tab
2. Add:
   ```
   OPENAI_API_KEY = sk-your-api-key-here
   ENVIRONMENT = production
   DEBUG = false
   ```
3. Click **Save**

#### Step 4: Deploy
1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Note your deployment URL: `https://pharmaguard-backend.onrender.com`

**Test deployment:**
```bash
curl https://pharmaguard-backend.onrender.com/health
```

---

### Option 2: Deploy to Railway

Railway.app is another great free option with good Python support.

#### Step 1-2: Connect Repository
1. Go to https://railway.app
2. Click **New Project** → **Deploy from GitHub**
3. Select your PharmaGuard repository
4. Select the root directory

#### Step 3: Configure
1. Add Service → Docker (if not auto-detected)
2. Set environment variables:
   - `OPENAI_API_KEY`
   - `ENVIRONMENT=production`

#### Step 4: Deploy
- Railway auto-deploys on push to main
- Get URL from Dashboard → Service domain

---

### Option 3: Deploy to Heroku (Paid Tier Required)

Heroku free tier was discontinued, but paid tier is still viable.

#### Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Authenticate & Create App
```bash
heroku login
heroku create pharmaguard-backend
```

#### Step 3: Add Buildpack
```bash
heroku buildpacks:add heroku/python
```

#### Step 4: Set Environment Variables
```bash
heroku config:set OPENAI_API_KEY=sk-your-api-key
heroku config:set ENVIRONMENT=production
```

#### Step 5: Create Procfile
In root directory:
```
web: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### Step 6: Deploy
```bash
git push heroku main
```

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest option for static sites.

#### Step 1: Push Code to GitHub
```bash
git push origin main
```

#### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click **"Import Project"**
3. Select GitHub repository
4. Choose `frontend` as root directory
5. Click **Import**

#### Step 3: Configure Environment Variables
1. In Vercel dashboard → **Settings** → **Environment Variables**
2. Add (if using build-time config):
   ```
   NEXT_PUBLIC_API_URL = https://pharmaguard-backend.onrender.com
   ```

#### Step 4: Deploy
1. Click **Deploy**
2. Wait for deployment
3. Get your frontend URL: `https://pharmaguard.vercel.app`

#### Step 5: Update Frontend API Endpoint
Since frontend is static, you need to update the API URL in the HTML:

**In `frontend/index.html`, find:**
```javascript
const API_BASE='http://localhost:8000';
```

**Replace with your backend URL:**
```javascript
const API_BASE='https://pharmaguard-backend.onrender.com';
```

**Then recommit and push:**
```bash
git add frontend/index.html
git commit -m "Update API URL for production"
git push origin main
```

---

### Option 2: Deploy to Netlify

#### Step 1: Push Code
```bash
git push origin main
```

#### Step 2: Connect Netlify
1. Go to https://netlify.com
2. Click **"New site from Git"**
3. Select GitHub repository
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** (leave empty)
   - **Publish directory:** `frontend`

#### Step 3: Update API URL
Same as Vercel - update HTML and push

#### Step 4: Deploy
1. Click **Deploy site**
2. Get your URL: `https://pharmaguard.netlify.app`

---

## Post-Deployment Checklist

- [ ] Backend API health check: `/health` returns 200
- [ ] API test: `/api/genes` and `/api/drugs` return data
- [ ] Frontend loads without errors (check browser console)
- [ ] VCF upload works with sample files
- [ ] Analysis completes successfully
- [ ] JSON export/copy works
- [ ] Environment variables properly set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate working
- [ ] CORS configured correctly
- [ ] Error logging enabled
- [ ] Rate limiting configured (optional)

---

## Monitoring & Troubleshooting

### Monitor Backend Logs
```bash
# Render
# Dashboard → Service → Logs

# Railway
# Dashboard → Service → Logs

# Heroku
heroku logs --tail
```

### Common Deployment Issues

#### Issue: "Module not found" errors
**Solution:**
```bash
# Ensure requirements.txt is in backend/ directory
# Check requirements.txt has all dependencies:
# - fastapi
# - uvicorn
# - python-multipart
# - openai
# - python-dotenv
```

#### Issue: 502 Bad Gateway
**Solution:**
- Check backend logs for startup errors
- Verify environment variables are set
- Ensure Python version is 3.11+
- Check that uvicorn is running on correct port

#### Issue: API call fails with CORS error
**Solution:**
- Verify `CORSMiddleware` is configured in `main.py`
- Check frontend API URL matches backend hostname
- Restart backend after changes

#### Issue: OpenAI API errors
**Solution:**
- Check API key is valid
- Check API key has sufficient credits
- Check API key has not been revoked
- Verify OPENAI_API_KEY is set in environment
- Note: App works fine without API key (uses fallback)

### Performance Optimization

#### Cache VCF Parsing
For frequently analyzed files, consider caching:
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def parse_vcf_cached(content_hash, content):
    return vcf_parser.parse(content)
```

#### Add Rate Limiting
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/analyze")
@limiter.limit("10/minute")  # 10 requests per minute
async def analyze_pharmacogenomics(...):
    ...
```

#### Database Caching
Consider adding Redis for caching variant database:
```python
import redis
cache = redis.Redis(host='redis-hostname', port=6379)
```

---

## Production Best Practices

### Security

1. **Environment Variables**
   ```bash
   # Never commit .env file
   # Always use platform's secret management
   ```

2. **API Authentication**
   ```python
   from fastapi.security import HTTPBearer, HTTPAuthCredential
   
   security = HTTPBearer()
   
   @app.post("/api/analyze")
   async def analyze(credentials: HTTPAuthCredential = Depends(security)):
       ...
   ```

3. **Input Validation**
   - Validate file size (max 5MB) ✓
   - Validate file format (VCF) ✓
   - Sanitize drug names
   - Add type checking with Pydantic ✓

4. **HTTPS Only**
   - Redirect HTTP to HTTPS
   - Set Secure flag on cookies
   - Include HSTS header

5. **Error Handling**
   - Never expose system paths in errors
   - Log errors securely
   - Return generic error messages to users

### Performance

1. **Compression**
   ```python
   from fastapi.middleware.gzip import GZIPMiddleware
   app.add_middleware(GZIPMiddleware, minimum_size=1000)
   ```

2. **Connection Pooling**
   - Use persistent OpenAI client
   - Pool database connections

3. **Caching**
   - Cache variant database after first load
   - Cache LLM explanations for common variants

### Monitoring

1. **Logging**
   ```python
   import logging
   logger = logging.getLogger(__name__)
   logger.info(f"Analysis completed for {patient_id}")
   ```

2. **Health Checks**
   - Regular health check endpoint
   - Monitor response times
   - Alert on failures

3. **Metrics**
   - Track analysis requests
   - Monitor API response times
   - Track error rates

---

## Cost Estimates

### Free Tier Options
- **Backend:** Render Free ($0/month, 750 compute hours)
- **Frontend:** Vercel Free ($0/month, unlimited)
- **OpenAI:** Pay-as-you-go ($0.0015 per 1K tokens)

### Production Tier Pricing
- **Backend:** Render Starter+ ($7/month) or Railway ($5/month minimum)
- **Frontend:** Vercel Pro ($20/month) or Netlify Pro ($19/month)
- **OpenAI:** Depends on usage (typical: $10-50/month for 10K-100K requests)

---

## Rollback Procedure

### If Deployment Goes Wrong

**Render:**
```
Dashboard → Service → Deployments → Select Previous → Click "Deploy"
```

**Railway:**
```
Dashboard → Service → Deployments → Click Previous Deployment
```

**Heroku:**
```bash
heroku releases
heroku rollback v123  # specific version
```

---

## Continuous Integration (Optional)

Add GitHub Actions for automated testing/deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy PharmaGuard

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          pytest .

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```

---

## Support & Troubleshooting

- **Render Support:** https://render.com/help
- **Vercel Support:** https://vercel.com/support
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **OpenAI API Status:** https://status.openai.com

---

**Last Updated:** February 2024  
**For Issues:** GitHub Issues or Contact Support
