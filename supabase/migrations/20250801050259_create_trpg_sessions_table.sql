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
