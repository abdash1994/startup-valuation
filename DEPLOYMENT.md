# Deployment Guide

This guide covers how to deploy Startup Value Navigator and manage your GitHub repository.

## 🎯 Deployment Strategy Overview

| Approach | Source Code | Live App | Best For |
|----------|-------------|----------|----------|
| **Public Repo + Vercel** | Visible | Public | Open source, portfolio |
| **Private Repo + Vercel** | Hidden | Public | Commercial, proprietary |
| **Public Repo + GitHub Pages** | Visible | Public | Free hosting |

---

## 🚀 Option 1: Deploy to Vercel (Recommended)

Vercel offers the best experience for React/Vite apps with automatic deployments.

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### Step 2: Import Project
1. Click "New Project"
2. Import your GitHub repository
3. Vercel auto-detects Vite configuration

### Step 3: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### Step 4: Deploy
Click "Deploy" - Vercel handles everything automatically.

**Your app will be live at:** `https://your-project.vercel.app`

### Automatic Deployments
Every push to `main` triggers a new deployment automatically.

---

## 🌐 Option 2: Deploy to GitHub Pages

GitHub Pages is free but requires a public repository for free accounts.

### Step 1: Update vite.config.ts

Add the `base` option for GitHub Pages:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/startup-valuation/',  // Your repo name
})
```

### Step 2: Add GitHub Secrets
Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:
- `VITE_SUPABASE_URL` - Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Step 3: Enable GitHub Pages
Go to: Repository → Settings → Pages
- Source: "GitHub Actions"

### Step 4: Push to Main
The workflow in `.github/workflows/deploy.yml` will automatically build and deploy.

**Your app will be live at:** `https://yourusername.github.io/startup-valuation/`

---

## 🔒 Protecting Your Source Code

### If You Want Code Visible But Protected:

1. **Use the BSL License** (included) - Allows viewing but restricts commercial use
2. **Add Copyright Headers** to source files
3. **Include Attribution Requirements** in LICENSE

### If You Want Code Hidden:

1. **Make Repository Private** on GitHub
2. **Deploy to Vercel** (works with private repos on free tier)
3. **Share only the Vercel URL**

---

## 📋 GitHub Repository Setup

### Step 1: Initialize Git (if not already)
```bash
git init
git add .
git commit -m "Initial commit: Startup Value Navigator v2.0"
```

### Step 2: Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Name: `startup-valuation` (or your preference)
3. Choose: **Public** (for visibility) or **Private** (for protection)
4. Do NOT initialize with README (we have one)

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/startup-valuation.git
git branch -M main
git push -u origin main
```

### Step 4: Add Repository Topics
Go to repository → About (gear icon) → Topics:
- `startup-valuation`
- `react`
- `typescript`
- `saas`
- `venture-capital`
- `fintech`

### Step 5: Enable Features
- ✅ Issues (for bug reports)
- ❌ Wiki (not needed)
- ✅ Discussions (optional, for community)

---

## 🔐 Environment Variables Checklist

**Local Development (`.env` file - NEVER commit):**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

**Vercel (Dashboard → Environment Variables):**
- Add both variables above
- Select: Production, Preview, Development

**GitHub Actions (Repository → Settings → Secrets):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🎨 Customizing the Demo URL in README

After deployment, update `README.md`:

```markdown
[🌐 Live Demo](https://your-actual-url.vercel.app)
```

---

## ✅ Pre-Deployment Checklist

- [ ] All code committed to Git
- [ ] `.env` file is in `.gitignore`
- [ ] Environment variables set in deployment platform
- [ ] Supabase project is active
- [ ] Database schema applied (`supabase/schema.sql`)
- [ ] Build passes locally (`npm run build`)
- [ ] LICENSE file present
- [ ] README.md updated with correct URLs

---

## 🆘 Troubleshooting

### Build Fails on Vercel/GitHub Pages
- Check environment variables are set
- Verify `package.json` has correct build script
- Check for TypeScript errors: `npm run build` locally

### Auth Not Working After Deploy
- Verify Supabase URL and anon key are correct
- Check Supabase → Authentication → URL Configuration
- Add your deployment URL to allowed redirect URLs in Supabase

### 404 on Page Refresh
- Ensure `vercel.json` has rewrite rules (included)
- For GitHub Pages, add a `404.html` that redirects to `index.html`

---

## 📞 Support

If you encounter issues:
1. Check the [Issues](../../issues) page
2. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment (browser, OS)

