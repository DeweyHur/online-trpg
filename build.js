const fs = require('fs');
const path = require('path');

// Read the source HTML file
const sourcePath = path.join(__dirname, 'index.html');
const targetPath = path.join(__dirname, 'index-built.html');

let htmlContent = fs.readFileSync(sourcePath, 'utf8');

// Replace environment variable placeholders
htmlContent = htmlContent.replace(
    /'YOUR_SUPABASE_URL'/g,
    `'${process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'}'`
);

htmlContent = htmlContent.replace(
    /'YOUR_SUPABASE_ANON_KEY'/g,
    `'${process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'}'`
);

// Write the processed HTML file
fs.writeFileSync(targetPath, htmlContent);

console.log('✅ Built index-built.html with environment variables'); 