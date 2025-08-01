-- Create the trpg_sessions table
CREATE TABLE IF NOT EXISTS public.trpg_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gemini_api_key TEXT NOT NULL,
    players JSONB DEFAULT '{}'::jsonb,
    chat_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trpg_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies that allow both authenticated and anonymous users to access sessions
-- This makes the app usable by anyone without requiring authentication
CREATE POLICY "Allow public read access to sessions" ON public.trpg_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to sessions" ON public.trpg_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to sessions" ON public.trpg_sessions
    FOR UPDATE USING (true);

-- Optional: More restrictive policy for production (uncomment if needed)
-- CREATE POLICY "Allow authenticated users to manage sessions" ON public.trpg_sessions
--     FOR ALL USING (auth.role() = 'authenticated');

-- Create an index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_trpg_sessions_created_at ON public.trpg_sessions(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_trpg_sessions_updated_at 
    BEFORE UPDATE ON public.trpg_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time for the trpg_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.trpg_sessions; 