const http = require('http');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Initialize Supabase client on the server
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

console.log('🔗 Initializing Supabase connection...');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 4)}`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
async function testSupabaseConnection() {
    try {
        console.log('🧪 Testing Supabase connection...');
        const { data, error } = await supabase
            .from('trpg_sessions')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Supabase connection failed:', error);
            return false;
        } else {
            console.log('✅ Supabase connection successful!');
            return true;
        }
    } catch (error) {
        console.error('❌ Supabase connection error:', error);
        return false;
    }
}

// Read the HTML file
let htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const server = http.createServer(async (req, res) => {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Parse URL and method
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;
    const method = req.method;

    try {
        if (pathname === '/' || pathname === '/index.html') {
            // Serve the main HTML file
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        } else if (pathname === '/index-guest.html') {
            // Serve the guest HTML file
            const guestHtmlContent = fs.readFileSync(path.join(__dirname, 'index-guest.html'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(guestHtmlContent);
        } else if (pathname === '/index-server.html') {
            // Serve the server gateway HTML file
            const serverHtmlContent = fs.readFileSync(path.join(__dirname, 'index-server.html'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(serverHtmlContent);
        } else if (pathname.startsWith('/api/')) {
            // Handle API requests
            await handleApiRequest(req, res, pathname, method);
        } else if (pathname.endsWith('.js') || pathname.endsWith('.css')) {
            // Serve static files
            const filePath = path.join(__dirname, pathname.substring(1));
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const contentType = pathname.endsWith('.js') ? 'application/javascript' : 'text/css';
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            } else {
                res.writeHead(404);
                res.end('File not found');
            }
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
    }
});

async function handleApiRequest(req, res, pathname, method) {
    if (pathname === '/api/sessions' && method === 'POST') {
        // Create new session
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { geminiApiKey, startingPrompt } = JSON.parse(body);
                console.log('📝 Creating session with data:', {
                    geminiApiKey: geminiApiKey ? '***' : 'undefined',
                    startingPrompt: startingPrompt ? `${startingPrompt.substring(0, 50)}...` : 'undefined'
                });

                const sessionData = {
                    gemini_api_key: geminiApiKey,
                    players: {},
                    chat_history: [],
                    current_turn: null,
                    turn_order: [],
                    created_at: new Date().toISOString()
                };

                console.log('🗄️ Inserting session into Supabase...');
                const { data: session, error } = await supabase
                    .from('trpg_sessions')
                    .insert(sessionData)
                    .select()
                    .single();

                if (error) {
                    console.error('❌ Supabase insert error:', error);
                    throw error;
                }

                console.log('✅ Session created successfully:', { id: session.id });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ session }));
            } catch (error) {
                console.error('Create session error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message || 'Failed to create session' }));
            }
        });
    } else if (pathname.startsWith('/api/sessions/') && method === 'GET') {
        // Get session by ID
        const sessionId = pathname.split('/')[3];
        try {
            const { data: session, error } = await supabase
                .from('trpg_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (error) throw error;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ session }));
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Session not found' }));
        }
    } else if (pathname.startsWith('/api/sessions/') && method === 'PUT') {
        // Update session
        const sessionId = pathname.split('/')[3];
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const updateData = JSON.parse(body);

                const { data, error } = await supabase
                    .from('trpg_sessions')
                    .update(updateData)
                    .eq('id', sessionId)
                    .select()
                    .single();

                if (error) throw error;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ session: data }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else if (pathname === '/api/gemini' && method === 'POST') {
        // Call Gemini API
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { prompt, apiKey, chatHistory } = JSON.parse(body);

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
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ response: text }));
                } else {
                    throw new Error("No content generated.");
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('API endpoint not found');
    }
}

server.listen(PORT, async () => {
    console.log(`🚀 Development server running at http://localhost:${PORT}`);
    console.log(`📝 Make sure to create a .env file with your Supabase credentials`);
    console.log(`📋 Copy env.example to .env and update the values`);
    console.log(`🔧 Server is now acting as a gateway to Supabase`);

    // Test Supabase connection on startup
    await testSupabaseConnection();
}); 