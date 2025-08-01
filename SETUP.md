# Quick Setup Guide

## 🎮 Guest Access Setup (Recommended)

### Option A: Use Guest Version (Easiest)
1. **Use `index-guest.html`** - This version has hardcoded Supabase credentials
2. **No setup required** - Anyone can use it immediately
3. **Deploy directly** - Works on any static hosting

### Option B: Configure Your Own Supabase (More Control)

## 🚀 Local Development Setup

### 1. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings** → **API**
3. Copy your **Project URL** and **anon public** key
4. Update your `.env` file:

```bash
SUPABASE_URL=https://your-actual-project-id.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Authentication Configuration (Optional)
AUTH_GUEST_EMAIL=guest@trpg.local
AUTH_GUEST_PASSWORD=guest123456
```

### 2. Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to create the table

### 3. Test Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. You should see the TRPG app (not the configuration error)

### 4. Test the App

1. Create a new session with your Gemini API key
2. Or join an existing session with a session ID
3. Create a character and start playing!

## 🌐 Deploy to Vercel

### 1. Deploy
```bash
vercel
```

### 2. Set Environment Variables
1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `AUTH_GUEST_EMAIL`: guest@trpg.local (optional)
   - `AUTH_GUEST_PASSWORD`: guest123456 (optional)

### 3. Your app is live! 🎉

## 🔧 Troubleshooting

### Configuration Error
If you see a configuration error page:
- Check that your `.env` file has the correct credentials
- Make sure the development server is running
- Verify your Supabase project is active

### Database Errors
If you get database errors:
- Make sure you ran the SQL schema
- Check that your Supabase project is in the same region as your users

### Real-time Not Working
- Ensure real-time is enabled in Supabase
- Check that the table is added to the realtime publication 