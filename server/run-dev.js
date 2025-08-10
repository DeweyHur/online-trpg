#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

console.log(`🔍 Current Node.js version: ${nodeVersion}`);

if (majorVersion < 20) {
    console.log('⚠️  Warning: Node.js version is below 20.0.0');
    console.log('📋 Supabase requires Node.js 20 or later.');
    console.log('💡 Please upgrade Node.js or use nvm to switch to a newer version.');
    console.log('');
    console.log('To use nvm:');
    console.log('  nvm use 23.11.0');
    console.log('  node server/dev-server.js');
    console.log('');
    process.exit(1);
}

console.log('✅ Node.js version is compatible with Supabase');
console.log('🚀 Starting development server...\n');

// Start the development server
try {
    require('./dev-server.js');
} catch (error) {
    console.error('❌ Failed to start development server:', error.message);
    process.exit(1);
} 