#!/bin/bash

# Use the correct Node.js version
NODE_PATH="$HOME/.nvm/versions/node/v23.11.0/bin/node"

echo "🚀 Starting TRPG development server with Node.js v23.11.0..."
echo "📋 This version is compatible with Supabase requirements"
echo ""

# Start the development server
$NODE_PATH run-dev.js 