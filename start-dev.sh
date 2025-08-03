#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js version 23.11.0
nvm use 23.11.0

# Check Node.js version
echo "Using Node.js version: $(node --version)"

# Start the development server
echo "Starting development server..."
node dev-server.js 