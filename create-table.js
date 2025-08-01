const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

console.log('🔗 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 4)}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
    try {
        console.log('🗄️ Creating trpg_sessions table...');

        // Create the table
        const { error: createError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS public.trpg_sessions (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    gemini_api_key TEXT NOT NULL,
                    players JSONB DEFAULT '{}',
                    chat_history JSONB DEFAULT '[]',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });

        if (createError) {
            console.error('❌ Error creating table:', createError);
            return false;
        }

        console.log('✅ Table created successfully!');

        // Enable RLS
        console.log('🔒 Enabling Row Level Security...');
        const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.trpg_sessions ENABLE ROW LEVEL SECURITY;'
        });

        if (rlsError) {
            console.error('❌ Error enabling RLS:', rlsError);
            return false;
        }

        console.log('✅ RLS enabled successfully!');

        // Create policies
        console.log('📋 Creating policies...');
        const policies = [
            'CREATE POLICY "Allow public read access to sessions" ON public.trpg_sessions FOR SELECT USING (true);',
            'CREATE POLICY "Allow public insert access to sessions" ON public.trpg_sessions FOR INSERT WITH CHECK (true);',
            'CREATE POLICY "Allow public update access to sessions" ON public.trpg_sessions FOR UPDATE USING (true);'
        ];

        for (const policy of policies) {
            const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy });
            if (policyError) {
                console.error('❌ Error creating policy:', policyError);
                return false;
            }
        }

        console.log('✅ Policies created successfully!');

        // Create index
        console.log('📊 Creating index...');
        const { error: indexError } = await supabase.rpc('exec_sql', {
            sql: 'CREATE INDEX IF NOT EXISTS idx_trpg_sessions_created_at ON public.trpg_sessions(created_at);'
        });

        if (indexError) {
            console.error('❌ Error creating index:', indexError);
            return false;
        }

        console.log('✅ Index created successfully!');
        console.log('🎉 Database setup complete!');

        return true;
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return false;
    }
}

// Run the setup
createTable().then(success => {
    if (success) {
        console.log('🚀 Ready to use the TRPG app!');
        process.exit(0);
    } else {
        console.log('💥 Setup failed. Please check the errors above.');
        process.exit(1);
    }
}); 