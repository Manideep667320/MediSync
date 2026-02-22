# MediSync - Single Deployment Guide (Monorepo)

## Deploy Both Frontend & Backend Together on Vercel

---

## Prerequisites

1. ✅ **GitHub Account** - Code is already pushed
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas** - Free cloud database

---

## Step 1: Setup MongoDB Atlas (5 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account → Create free M0 cluster
3. **Database Access**: Create a user with password
4. **Network Access**: Add IP `0.0.0.0/0` (allow all)
5. Click **"Connect"** → **"Connect your application"** → Copy connection string
   ```
   mongodb+srv://username:password@cluster.mongodb.net/medisync
   ```
6. Replace `<password>` with your actual password

---

## Step 2: Deploy to Vercel (Single Project)

### Using Vercel Dashboard:

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. Click **"Add New"** → **"Project"**

3. Import your repository: `Manideep667320/MediSync`

4. **Project Settings:**
   ```
   Framework Preset: Other
   Root Directory: ./  (leave as root)
   Build Command: cd frontend && npm install && npm run build
   Output Directory: frontend/dist
   Install Command: npm install && cd backend && npm install
   ```

5. **Add Environment Variables** (Click "Environment Variables"):
   ```
   MONGO_URI=mongodb+srv://your-connection-string
   JWT_SECRET=2f9c0f785e4d2f5bb8e8f6d0d1732bce9ad8b8847fa429d7cee44adb5f7280e1
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-project.vercel.app
   VITE_API_URL=/api
   ```
   ⚠️ Replace `your-project.vercel.app` with your actual domain after first deployment

6. Click **"Deploy"** 🚀

7. **After First Deployment:**
   - Copy your deployed URL (e.g., `medisync-xyz.vercel.app`)
   - Go to **Settings** → **Environment Variables**
   - Update `FRONTEND_URL` to `https://medisync-xyz.vercel.app`
   - **Redeploy**: Go to **Deployments** → Click ••• on latest → **Redeploy**

---

## Step 3: Test Your Deployment

Visit your Vercel URL:
- **Landing Page**: `https://your-project.vercel.app`
- **API Health**: `https://your-project.vercel.app/api/hospitals`
- **Test Registration**: Try creating an account

---

## Project Structure

Your deployed app will have:
```
https://your-project.vercel.app/          → Frontend (React)
https://your-project.vercel.app/api/*     → Backend API (Node.js)
```

Everything is served from one domain, so **no CORS issues**! 🎉

---

## Pros & Cons

### ✅ Advantages (Single Deployment):
- **One domain** - No CORS configuration needed
- **Single deployment** - Easier to manage
- **Simpler URLs** - Clean API paths like `/api/login`

### ⚠️ Considerations:
- Vercel serverless functions have **10s timeout** on free plan
- For long-running operations, separate backend is better
- Slightly slower cold starts for API

---

## Alternative: Separate Deployments (Better for Production)

If you need:
- Longer API timeouts
- More backend control
- Better scaling

**Deploy separately:**
- **Backend** → [Railway.app](https://railway.app) (no timeout limits, $5/month)
- **Frontend** → Vercel (free, perfect for static sites)

See main `DEPLOYMENT_GUIDE.md` for separate deployment instructions.

---

## Seed Database (Optional)

After deployment, seed your MongoDB Atlas database:

```bash
# Update backend/.env with your Atlas connection string
MONGO_URI=mongodb+srv://...

# Run seeder
cd backend
npm run seed
```

This populates your database with sample hospitals, doctors, patients, etc.

---

## Updating Your Deployment

To push updates:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will **automatically redeploy** when you push to GitHub! 🔄

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Not Working
- Check MongoDB Atlas connection string
- Verify environment variables are set
- Check function logs in Vercel dashboard

### CORS Errors
- Since everything is on one domain, you shouldn't have CORS issues
- If you do, verify `FRONTEND_URL` matches your Vercel domain

### MongoDB Connection Fails
- Check MongoDB Atlas network access allows `0.0.0.0/0`
- Verify database user credentials
- Test connection string locally first

---

## Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| `MONGO_URI` | `mongodb+srv://...` | Database connection |
| `JWT_SECRET` | Random secure string | Authentication |
| `NODE_ENV` | `production` | Environment mode |
| `FRONTEND_URL` | Your Vercel URL | CORS configuration |
| `VITE_API_URL` | `/api` | Frontend API calls |
| `PORT` | `5000` | Backend port |

---

## Custom Domain (Optional)

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Vercel: **Settings** → **Domains** → Add your domain
3. Update DNS records as shown
4. Update `FRONTEND_URL` env variable to your custom domain

---

## Monitoring

- **Logs**: Vercel Dashboard → Your Project → "Logs" tab
- **Analytics**: See visitor stats and performance
- **Deployments**: Track all deployment history

---

## Need Help?

- [Vercel Monorepo Docs](https://vercel.com/docs/concepts/monorepos)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [GitHub Repo](https://github.com/Manideep667320/MediSync)

---

**Your app is now deployed on a single domain! 🎉**

Both frontend and backend are running from: `https://your-project.vercel.app`
