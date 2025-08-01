-- Add turn system columns to trpg_sessions table
ALTER TABLE public.trpg_sessions 
ADD COLUMN IF NOT EXISTS current_turn TEXT,
ADD COLUMN IF NOT EXISTS turn_order JSONB DEFAULT '[]'; 