const http = require('http');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3000;

// In-memory storage for testing (no Supabase required)
let sessions = new Map();
let sessionCounter = 1;

// Read the HTML file
let htmlContent = fs.readFileSync(path.join(__dirname, 'index-server.html'), 'utf8');

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
        } else if (pathname === '/index-server.html') {
            // Serve the server gateway HTML file
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        } else if (pathname.startsWith('/api/')) {
            // Handle API requests
            await handleApiRequest(req, res, pathname, method);
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

                const session = {
                    id: `session_${sessionCounter++}`,
                    gemini_api_key: geminiApiKey,
                    players: {},
                    chat_history: [],
                    created_at: new Date().toISOString()
                };

                sessions.set(session.id, session);

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
            const session = sessions.get(sessionId);

            if (!session) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Session not found' }));
                return;
            }

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
                const session = sessions.get(sessionId);

                if (!session) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Session not found' }));
                    return;
                }

                // Update session
                Object.assign(session, updateData);
                sessions.set(sessionId, session);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ session }));
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

server.listen(PORT, () => {
    console.log(`🚀 Simple development server running at http://localhost:${PORT}`);
    console.log(`📝 No Supabase required - using in-memory storage`);
    console.log(`🔧 Server is now acting as a gateway with local storage`);
}); 