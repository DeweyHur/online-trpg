# Database Setup Guide

Since the Supabase CLI is having permission issues, let's set up the database using the Supabase Dashboard.

## Step 1: Go to Your Supabase Project

1. Open your browser and go to: https://supabase.com/dashboard/project/zaxrcdalesdbfnccpqzs
2. Click on "SQL Editor" in the left sidebar

## Step 2: Run the SQL Script

Copy and paste this entire SQL script into the SQL Editor:

```sql
-- Create the trpg_sessions table
CREATE TABLE IF NOT EXISTS public.trpg_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gemini_api_key TEXT NOT NULL,
    players JSONB DEFAULT '{}',
    chat_history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.trpg_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (guest mode)
CREATE POLICY "Allow public read access to sessions" ON public.trpg_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to sessions" ON public.trpg_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to sessions" ON public.trpg_sessions
    FOR UPDATE USING (true);

-- Create an index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_trpg_sessions_created_at ON public.trpg_sessions(created_at);
```

## Step 3: Execute the Script

1. Click the "Run" button (or press Ctrl+Enter)
2. You should see a success message

## Step 4: Verify the Setup

After running the script, you can verify it worked by running this query:

```sql
SELECT * FROM public.trpg_sessions LIMIT 1;
```

This should return an empty result (no rows), which means the table was created successfully.

## Step 5: Test the Server

Once the table is created, restart your development server:

```bash
npm run dev
```

You should see:
```
✅ Supabase connection successful!
```

## Alternative: Use the Simple Server

If you want to test immediately without setting up Supabase, use:

```bash
npm run dev-simple
```

This uses in-memory storage and doesn't require the database setup. 