# Deployment Guide 🚀

## Option 1: GitHub Pages (Frontend Only - Recommended for Demo)

### Step 1: Push to GitHub
```bash
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/uae-climate-system.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Frontend
```bash
npm run build
# Then deploy the 'dist' folder to GitHub Pages
```

**Note:** GitHub Pages won't run the Python backend. Use for frontend demo only.

---

## Option 2: Vercel (Best for Full Demo) ⭐ RECOMMENDED

### Frontend Deployment

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** ./uae-flood-app
   - **Build Command:** npm run build
   - **Output Directory:** dist
6. Add Environment Variable:
   - Name: `VITE_WEATHER_API_KEY`
   - Value: Your OpenWeatherMap API key
7. Click "Deploy"

**Result:** Your frontend will be live at `your-project.vercel.app`

### Backend Deployment (Optional)

Deploy Python backend separately:
1. Create new Vercel project for backend
2. Use `vercel.json`:
```json
{
  "builds": [{ "src": "backend/api.py", "use": "@vercel/python" }],
  "routes": [{ "src": "/(.*)", "dest": "backend/api.py" }]
}
```

---

## Option 3: Netlify (Alternative)

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub
4. Configure:
   - **Base directory:** uae-flood-app
   - **Build command:** npm run build
   - **Publish directory:** uae-flood-app/dist
5. Deploy!

---

## Option 4: Render (Full Stack)

**Frontend:**
1. Go to https://render.com
2. New → Static Site
3. Connect GitHub repo
4. Build: `cd uae-flood-app && npm install && npm run build`
5. Publish: `uae-flood-app/dist`

**Backend:**
1. New → Web Service
2. Connect same repo
3. Build: `cd uae-flood-app/backend && pip install -r requirements.txt`
4. Start: `cd uae-flood-app/backend && python api.py`

---

## Quick GitHub Upload (For Hackathon Submission)

```bash
# 1. Create repo on GitHub.com (click + button, New repository)
# 2. Name it: uae-climate-system
# 3. DON'T initialize with README (you already have one)
# 4. Copy the commands GitHub shows, OR use these:

git remote add origin https://github.com/YOUR_USERNAME/uae-climate-system.git
git branch -M main
git push -u origin main
```

**That's it!** Your code is now on GitHub and anyone can view it.

---

## Make It Public (Web Hosting)

### Fastest Option - Vercel (2 minutes):

1. Visit: https://vercel.com/new
2. Sign in with GitHub
3. Click your `uae-climate-system` repo
4. Click "Import"
5. Framework Preset: **Vite**
6. Root Directory: `uae-flood-app`
7. Click "Deploy"

**✅ DONE!** You'll get a link like: `uae-climate-system.vercel.app`

Share this link with anyone!

---

## Important Notes

### For Demo (Real Time Mode Only):
- Deploy frontend only (Vercel/Netlify)
- Works with OpenWeatherMap API
- No Python backend needed

### For Full Features (Python AI Mode):
- Deploy both frontend AND backend
- Use Render or Railway for backend
- Update API endpoint in frontend

### Environment Variables:
Add to your hosting platform:
```
VITE_WEATHER_API_KEY=your_openweathermap_key
```

---

## Testing Locally

```bash
# Frontend
npm run dev

# Backend (separate terminal)
cd backend
python api.py
```

Visit: http://localhost:5173

---

## Troubleshooting

**"Module not found"**
→ Run `npm install` in uae-flood-app directory

**"Python API not connecting"**
→ Backend needs to be deployed separately or run locally

**"Map not loading"**
→ Check OpenWeatherMap API key is set correctly

---

**🎉 Your project is now live on the web!**
