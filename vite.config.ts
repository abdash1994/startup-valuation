import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages: /repo-name/
  // For other deployments (Netlify, Vercel), this should be '/'
  base: process.env.GITHUB_PAGES === 'true' ? '/startup-valuation/' : '/',
})
