-- Add character stats columns to trpg_sessions table
ALTER TABLE public.trpg_sessions 
ADD COLUMN IF NOT EXISTS character_stats JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stats_template TEXT DEFAULT 'default';

-- Create an index on character_stats for better performance
CREATE INDEX IF NOT EXISTS idx_trpg_sessions_character_stats ON public.trpg_sessions USING GIN (character_stats); 