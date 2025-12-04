# Startup Value Navigator - MVP Setup Guide

This guide will help you set up the MVP with user authentication and database storage.

## Prerequisites

- Node.js 18+ installed
- A free [Supabase](https://supabase.com) account

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Organization: Select or create one
   - Project name: `startup-valuation` (or your choice)
   - Database password: Generate a strong password (save it!)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for setup (~2 minutes)

## Step 2: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL
5. You should see success messages for all commands

## Step 3: Get Your API Keys

1. In Supabase dashboard, go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Replace the values with your actual Supabase credentials.

## Step 5: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email settings as needed (defaults work for development)

## Step 6: Run the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to see your app!

## Features Now Available

### Without Login:
- ✅ View landing page
- ✅ Use the valuation tool
- ✅ See real-time calculations

### With Login:
- ✅ Save valuations to database
- ✅ View all saved valuations in dashboard
- ✅ Edit existing valuations
- ✅ Delete valuations
- ✅ Track valuation history

## Application Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/valuator` | Valuation tool | No |
| `/login` | Login page | No |
| `/signup` | Signup page | No |
| `/dashboard` | User dashboard | Yes |

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env` file has the correct Supabase URL and key
- Make sure you're using the `anon` key, not the `service_role` key

### Can't sign up / login
- Check that Email provider is enabled in Supabase Auth settings
- Check your email for verification link (if enabled)

### Valuations not saving
- Make sure you ran the SQL schema in Supabase
- Check browser console for error messages
- Verify RLS policies are created correctly

## Production Deployment

For production, you'll want to:

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Configure a custom domain in Supabase
3. Set up email templates in Supabase Auth
4. Consider enabling additional auth providers (Google, GitHub, etc.)

## Security Notes

- The `anon` key is safe to expose in frontend code
- Row Level Security (RLS) ensures users can only access their own data
- Never expose the `service_role` key in frontend code

