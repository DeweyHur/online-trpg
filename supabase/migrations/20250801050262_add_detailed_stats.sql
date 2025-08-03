-- Add detailed_stats column to trpg_sessions table
ALTER TABLE trpg_sessions 
ADD COLUMN detailed_stats JSONB DEFAULT '{}';

-- Create GIN index for detailed_stats for efficient querying
CREATE INDEX idx_trpg_sessions_detailed_stats ON trpg_sessions USING GIN (detailed_stats); 