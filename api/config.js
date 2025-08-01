export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Set content type to JavaScript
  res.setHeader('Content-Type', 'application/javascript');

  // Create JavaScript code that sets the global variables
  const configScript = `
      window.SUPABASE_URL = '${process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'}';
      window.SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'}';
      window.AUTH_GUEST_EMAIL = '${process.env.AUTH_GUEST_EMAIL || 'guest@trpg.local'}';
      window.AUTH_GUEST_PASSWORD = '${process.env.AUTH_GUEST_PASSWORD || 'guest123456'}';
    `;

  res.status(200).send(configScript);
} 