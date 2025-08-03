# Node.js Version Fix for Supabase Compatibility

## Problem
The Supabase JavaScript client requires Node.js version 20 or later. If you're using an older version, you'll see this warning:

```
⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later.
```

## Solution
This project has been configured to use Node.js v23.11.0, which is compatible with Supabase requirements.

## How to Run the Server

### Option 1: Use the provided script (Recommended)
```bash
./start.sh
```

### Option 2: Use npm scripts
```bash
npm run dev
# or
npm start
```

### Option 3: Use nvm (if you have it configured)
```bash
nvm use 23.11.0
node dev-server.js
```

### Option 4: Use the full Node.js path
```bash
~/.nvm/versions/node/v23.11.0/bin/node dev-server.js
```

## Files Modified
- `.nvmrc`: Specifies Node.js version 23.11.0
- `package.json`: Added Node.js engine requirement and updated scripts
- `run-dev.js`: Version check script that ensures compatibility
- `start.sh`: Simple script to start the server with correct Node.js version
- `README.md`: Added Node.js version requirements section

## Verification
When you start the server correctly, you should see:
```
🔍 Current Node.js version: v23.11.0
✅ Node.js version is compatible with Supabase
🚀 Starting development server...
```

And the Supabase deprecation warning should be gone. 