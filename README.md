# Multiplayer TRPG Game

A real-time multiplayer tabletop role-playing game that uses Google's Gemini AI as the Game Master and Supabase for session management.

## Features

- 🎲 Real-time multiplayer TRPG sessions
- 🤖 AI-powered Game Master using Google Gemini
- 💬 Live chat with real-time updates
- 👥 Character creation and management
- 🔐 Session-based gameplay

## Deployment Guide

### 1. Deploy to Vercel

#### Option A: Deploy via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your project:
   ```bash
   vercel
   ```

#### Option B: Deploy via GitHub
1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect it's a static site and deploy

#### Environment Variables Setup
After deployment, set up your environment variables in Vercel:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

### 2. Set up Supabase

#### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization and project
4. Wait for the project to be ready

#### Step 2: Set up the Database Schema
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL commands

#### Step 3: Get Your Supabase Credentials
1. Go to Settings → API in your Supabase dashboard
2. Copy your Project URL and anon public key

#### Step 4: Update Your Application
1. Open `index.html`
2. The application will automatically load configuration from environment variables
3. For local development, create a `.env` file with your Supabase credentials

### 3. Environment Variables Setup

#### For Development (Local)
1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

#### For Production (Vercel)
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

The application will automatically detect and use these environment variables.

## How It Works

### Architecture
- **Frontend**: Static HTML with JavaScript (deployed on Vercel)
- **Backend**: Supabase (PostgreSQL database + real-time subscriptions)
- **AI**: Google Gemini API for Game Master responses

### Data Flow
1. User creates or joins a session
2. Session data is stored in Supabase
3. Real-time updates are pushed to all connected players
4. Player actions are sent to Gemini AI
5. AI responses are stored and broadcast to all players

### Security Considerations
- Gemini API keys are stored in the database (consider moving to server-side for production)
- Supabase Row Level Security (RLS) is enabled
- Anonymous authentication is used for simplicity

## File Structure

```
├── index.html              # Main application (Supabase version)
├── vercel.json            # Vercel deployment configuration
├── supabase-schema.sql    # Database schema
├── package.json           # Node.js dependencies
├── dev-server.js          # Development server with env support
├── build.js               # Build script for environment variables
├── api/config.js          # Vercel API endpoint for config
├── env.example            # Environment variables template
└── README.md              # This file
```

## Customization

### Styling
The app uses Tailwind CSS. You can customize the appearance by modifying the CSS classes in the HTML file.

### AI Model
To use a different AI model, update the `callGemini` function in the JavaScript code.

### Database Schema
Modify `supabase-schema.sql` to add additional fields or tables as needed.

## Troubleshooting

### Common Issues

1. **Real-time updates not working**
   - Ensure real-time is enabled in Supabase
   - Check that the table is added to the realtime publication

2. **Authentication errors**
   - Verify your Supabase URL and anon key
   - Check that RLS policies are correctly configured

3. **Gemini API errors**
   - Verify your API key is valid
   - Check the API quota and limits

### Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase and Vercel configurations
3. Ensure all environment variables are set correctly

## License

This project is open source and available under the MIT License. 