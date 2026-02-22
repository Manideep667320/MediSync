# MediSync Deployment Guide

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub ✅
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas** - Free cloud database at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## Step 1: Setup MongoDB Atlas (Cloud Database)

Your current setup uses local MongoDB. For production, you need a cloud database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/medisync`)
5. Replace `<password>` with your actual password
6. Keep this connection string handy for Step 3

---

## Step 2: Deploy Backend to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `Manideep667320/MediSync`
4. Configure:
   ```
   Framework Preset: Other
   Root Directory: backend
   Build Command: (leave empty)
   Output Directory: (leave empty)
   Install Command: npm install
   ```

5. **Add Environment Variables** (Click "Environment Variables"):
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://your-atlas-connection-string
   JWT_SECRET=2f9c0f785e4d2f5bb8e8f6d0d1732bce9ad8b8847fa429d7cee44adb5f7280e1
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
   ⚠️ You'll update `FRONTEND_URL` after deploying frontend

6. Click **"Deploy"**
7. Save the backend URL (e.g., `https://medisync-backend.vercel.app`)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel

# Follow prompts and add environment variables when asked
```

---

## Step 3: Deploy Frontend to Vercel

### Using Vercel Dashboard

1. Click **"Add New"** → **"Project"**
2. Select the same repository: `Manideep667320/MediSync`
3. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```
   (Use the backend URL from Step 2)

5. Click **"Deploy"**
6. Save the frontend URL (e.g., `https://medisync.vercel.app`)

### Using Vercel CLI

```bash
cd frontend
vercel
```

---

## Step 4: Update Backend CORS

After deploying frontend, update backend environment variables:

1. Go to backend project in Vercel Dashboard
2. Settings → Environment Variables
3. Update `FRONTEND_URL` to your actual frontend URL:
   ```
   FRONTEND_URL=https://medisync.vercel.app
   ```
4. Redeploy backend (Deployments → Click ••• → Redeploy)

---

## Step 5: Seed Database (Optional)

If you want to populate your production database with sample data:

1. Update `backend/.env` locally with your Atlas connection string
2. Run: `npm run seed`
3. This will populate your cloud database

---

## Alternative Deployment (Recommended for Better Backend Support)

### Backend → Railway/Render (Better for long-running servers)
### Frontend → Vercel

**Why?** Vercel has serverless function limitations (10s timeout on free plan). Railway/Render are better for traditional Node.js servers.

### Deploy Backend to Railway:

1. Go to [railway.app](https://railway.app)
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Select `MediSync` repository
4. Configure:
   - Root Directory: `backend`
   - Start Command: `npm start`
5. Add same environment variables as above
6. Railway will give you a URL (e.g., `https://medisync-backend.up.railway.app`)

### Deploy Frontend to Vercel:
(Same as Step 3, but use Railway backend URL in `VITE_API_URL`)

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in backend matches your actual frontend domain
- Redeploy backend after updating environment variables

### MongoDB Connection Issues
- Check MongoDB Atlas network access (allow all IPs: `0.0.0.0/0`)
- Verify connection string has correct password
- Ensure database user has proper permissions

### Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Make sure Node version is compatible (add `"engines"` field if needed)

### Environment Variables Not Working
- Make sure variables are added to BOTH production and preview environments
- Redeploy after adding/changing variables
- For frontend (Vite), variables must start with `VITE_`

---

## Post-Deployment Checklist

- [ ] Backend deploys successfully
- [ ] Frontend deploys successfully
- [ ] MongoDB Atlas is connected
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Test user registration/login
- [ ] Test hospital selection
- [ ] Test all major features

---

## Custom Domain (Optional)

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In Vercel project → Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update `FRONTEND_URL` in backend to use new domain

---

## Monitoring & Logs

- **Vercel Dashboard** → Your Project → "Logs" tab
- View real-time logs and errors
- Monitor function execution times
- Track deployment history

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Railway Docs: https://docs.railway.app/

---

**Good luck with your deployment! 🚀**
