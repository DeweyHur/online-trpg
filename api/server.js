const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
    process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
);

// Read the HTML file
const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { pathname } = new URL(req.url, `https://${req.headers.host}`);
    const method = req.method;

    try {
        // Serve static HTML
        if (pathname === '/' || pathname === '/index.html') {
            res.setHeader('Content-Type', 'text/html');
            res.end(htmlContent);
            return;
        }

        // Handle API requests
        if (pathname.startsWith('/api/')) {
            await handleApiRequest(req, res, pathname, method);
            return;
        }

        // Default: serve HTML for SPA routing
        res.setHeader('Content-Type', 'text/html');
        res.end(htmlContent);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

async function handleApiRequest(req, res, pathname, method) {
    if (pathname === '/api/sessions' && method === 'POST') {
        // Create new session
        try {
            const { geminiApiKey, startingPrompt } = req.body;

            const { data: session, error } = await supabase
                .from('trpg_sessions')
                .insert({
                    gemini_api_key: geminiApiKey,
                    players: {},
                    chat_history: [],
                    current_turn: null,
                    turn_order: [],
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            res.json({ session });
        } catch (error) {
            console.error('Create session error:', error);
            res.status(400).json({ error: error.message || 'Failed to create session' });
        }
    } else if (pathname.startsWith('/api/sessions/') && method === 'GET') {
        // Get session by ID
        try {
            const sessionId = pathname.split('/')[3];
            const { data: session, error } = await supabase
                .from('trpg_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (error) throw error;

            res.json({ session });
        } catch (error) {
            res.status(404).json({ error: 'Session not found' });
        }
    } else if (pathname.startsWith('/api/sessions/') && method === 'PUT') {
        // Update session
        try {
            const sessionId = pathname.split('/')[3];
            const updateData = req.body;

            const { data, error } = await supabase
                .from('trpg_sessions')
                .update(updateData)
                .eq('id', sessionId)
                .select()
                .single();

            if (error) throw error;

            res.json({ session: data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    } else if (pathname === '/api/gemini' && method === 'POST') {
        // Call Gemini API
        try {
            const { prompt, apiKey, chatHistory } = req.body;

            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=' + apiKey, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [...chatHistory, { role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 8192,
                    },
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                res.json({ response: text });
            } else {
                throw new Error("No content generated.");
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
} 