# Debug Guide for VS Code/Cursor

## 🚀 Quick Start

### Using Debug Configurations

1. **Open Debug Panel**: Press `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)
2. **Select Configuration**: Choose from the dropdown at the top
3. **Start Debugging**: Press `F5` or click the green play button

## 🔧 Available Debug Configurations

### 1. **Launch Development Server**
- **What it does**: Starts the development server with debugging enabled
- **Best for**: General development and debugging
- **How to use**: Select this and press F5

### 2. **Debug Development Server**
- **What it does**: Same as above but with better output capture
- **Best for**: When you need to see all console output
- **How to use**: Select this and press F5

### 3. **Launch with Breakpoints**
- **What it does**: Starts server and stops at breakpoints
- **Best for**: Step-by-step debugging
- **How to use**: Set breakpoints in your code, then select this and press F5

### 4. **Attach to Development Server**
- **What it does**: Attaches to an already running server
- **Best for**: When server is already running
- **How to use**: Start server manually first, then select this and press F5

## 🎯 Setting Breakpoints

### In JavaScript Files
1. Click in the left margin next to a line number
2. A red dot will appear
3. When debugging, execution will pause at this point

### In HTML Files
1. Open the browser's DevTools (F12)
2. Go to Sources tab
3. Find your HTML file and set breakpoints in the script section

## 🛠️ Using Tasks

### Available Tasks (Ctrl+Shift+P → "Tasks: Run Task")

1. **Start Development Server**: Starts the dev server
2. **Install Dependencies**: Runs `npm install`
3. **Deploy to Vercel**: Deploys your app
4. **Build for Production**: Runs the build script
5. **Open in Browser**: Opens localhost:3000
6. **Stop Development Server**: Kills the dev server

## 🔍 Debugging Tips

### Server-Side Debugging
- Set breakpoints in `dev-server.js`
- Use `console.log()` statements
- Check the Debug Console for output

### Client-Side Debugging
- Use browser DevTools (F12)
- Set breakpoints in the browser's Sources tab
- Check the browser's Console tab

### Environment Variables
- The debugger automatically loads your `.env` file
- Check the Debug Console to see environment variables
- Use `console.log(process.env.SUPABASE_URL)` to verify

## 🚨 Common Issues

### "Cannot connect to runtime"
- Make sure the development server is running
- Check if port 3000 is available
- Try restarting VS Code/Cursor

### "Environment variables not loading"
- Verify your `.env` file exists
- Check that the file path is correct
- Make sure the file has the right format

### "Breakpoints not hitting"
- Make sure you're using the right debug configuration
- Check that the file paths match
- Try restarting the debugger

## 🎮 Keyboard Shortcuts

- `F5`: Start debugging
- `Ctrl+F5` / `Cmd+F5`: Start without debugging
- `Shift+F5`: Stop debugging
- `Ctrl+Shift+F5` / `Cmd+Shift+F5`: Restart debugging
- `F9`: Toggle breakpoint
- `F10`: Step over
- `F11`: Step into
- `Shift+F11`: Step out

## 📝 Example Debug Session

1. **Set a breakpoint** in `dev-server.js` line 15
2. **Select "Launch Development Server"** from debug dropdown
3. **Press F5** to start debugging
4. **Server will pause** at your breakpoint
5. **Inspect variables** in the Debug panel
6. **Continue execution** with F5
7. **Open browser** and test your app
8. **Check console** for any errors 