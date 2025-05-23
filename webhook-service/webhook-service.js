const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Configuration from environment variables
const PORT = process.env.WEBHOOK_PORT || 3002;
const SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const REPO_PATH = process.env.REPO_PATH || '/workspace';
const TOUCH_PATHS = (process.env.TOUCH_PATHS || '').split(',').filter(Boolean);
const GIT_BRANCH = process.env.GIT_BRANCH || 'main';
const NODEMON_RESTART_CMD = process.env.NODEMON_RESTART_CMD || '';
const DEBUG = process.env.DEBUG === 'true';

// Log configuration on startup
console.log('Webhook Service Configuration:');
console.log(`- PORT: ${PORT}`);
console.log(`- REPO_PATH: ${REPO_PATH}`);
console.log(`- GIT_BRANCH: ${GIT_BRANCH}`);
console.log(`- TOUCH_PATHS: ${TOUCH_PATHS.length ? TOUCH_PATHS.join(', ') : 'None specified'}`);
console.log(`- NODEMON_RESTART_CMD: ${NODEMON_RESTART_CMD || 'None specified'}`);
console.log(`- DEBUG: ${DEBUG ? 'Enabled' : 'Disabled'}`);

// Debug logging function
function debugLog(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

// Main webhook endpoint
app.post('/webhook', (req, res) => {
  debugLog('Received webhook request', req.headers);
  
  // Verify signature if provided
  const signature = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'];
  const payload = JSON.stringify(req.body);
  
  if (signature) {
    debugLog('Verifying signature');
    const hmac = crypto.createHmac('sha256', SECRET);
    const calculatedSignature = 'sha256=' + hmac.update(payload).digest('hex');
    
    if (signature !== calculatedSignature) {
      console.log('Invalid webhook signature');
      return res.status(403).send('Invalid signature');
    }
    console.log('Signature verified successfully');
  } else {
    console.log('No signature provided, skipping verification (useful for testing)');
  }
  
  // Check if this is a test request
  if (req.query.test === 'true') {
    console.log('Test mode: Skipping git pull');
    simulateFileChanges();
    return res.status(200).send('Simulated file changes to trigger restart');
  }
  
  // Check if this is a GitHub push event
  const isGitHubPush = req.headers['x-github-event'] === 'push';
  const isPushToWatchedBranch = isGitHubPush && 
    req.body.ref && 
    (req.body.ref === `refs/heads/${GIT_BRANCH}` || GIT_BRANCH === '*');
  
  if (isGitHubPush && !isPushToWatchedBranch) {
    console.log(`Ignoring push to ${req.body.ref}, watching for ${GIT_BRANCH}`);
    return res.status(200).send('Ignored push to non-watched branch');
  }
  
  // Pull the latest changes
  console.log(`Pulling latest changes in ${REPO_PATH}...`);
  exec(`cd ${REPO_PATH} && git pull`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error pulling changes: ${error}`);
      console.error(stderr);
      return res.status(500).send('Error pulling changes');
    }
    
    console.log(`Git pull output: ${stdout}`);
    
    // If no files were changed by git pull, touch files to trigger nodemon
    if (stdout.includes('Already up to date.')) {
      console.log('No changes from git pull, touching files to trigger restart...');
      simulateFileChanges();
    } else {
      console.log('Changes pulled successfully, nodemon will detect changes and restart');
    }
    
    res.status(200).send('Changes processed successfully');
  });
});

// Function to simulate file changes to trigger nodemon
function simulateFileChanges() {
  // If specific paths are provided, touch those
  if (TOUCH_PATHS.length > 0) {
    TOUCH_PATHS.forEach(filePath => {
      const fullPath = path.join(REPO_PATH, filePath);
      touchFile(fullPath);
    });
    return;
  }
  
  // If a custom nodemon restart command is provided, use that
  if (NODEMON_RESTART_CMD) {
    console.log(`Executing custom nodemon restart command: ${NODEMON_RESTART_CMD}`);
    exec(NODEMON_RESTART_CMD, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing restart command: ${error}`);
        console.error(stderr);
      } else {
        console.log(`Restart command output: ${stdout}`);
      }
    });
    return;
  }
  
  // Otherwise, try to find common file patterns
  findAndTouchFiles();
}

// Function to find and touch common files
function findAndTouchFiles() {
  // Common patterns to look for
  const patterns = [
    'src/index.js',
    'app.js',
    'server.js',
    'index.js',
    'src/app.js',
    'src/server.js',
    'api/index.js',
    'backend/src/index.js',
    'packages/backend/src/index.js'
  ];
  
  let fileFound = false;
  
  for (const pattern of patterns) {
    const fullPath = path.join(REPO_PATH, pattern);
    if (fs.existsSync(fullPath)) {
      touchFile(fullPath);
      fileFound = true;
      break; // Found and touched one file, that's enough
    }
  }
  
  if (!fileFound) {
    console.log('Could not find any common files to touch. Searching for any .js files...');
    
    // Try to find any .js file in the src directory
    try {
      const srcPath = path.join(REPO_PATH, 'src');
      if (fs.existsSync(srcPath) && fs.statSync(srcPath).isDirectory()) {
        const files = fs.readdirSync(srcPath);
        const jsFiles = files.filter(file => file.endsWith('.js'));
        
        if (jsFiles.length > 0) {
          const filePath = path.join(srcPath, jsFiles[0]);
          touchFile(filePath);
          fileFound = true;
        }
      }
    } catch (error) {
      console.error(`Error searching src directory: ${error}`);
    }
  }
  
  if (!fileFound) {
    console.log('Could not find any files to touch. Nodemon may not detect changes.');
  }
}

// Function to touch a file
function touchFile(filePath) {
  console.log(`Touching file: ${filePath}`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist: ${filePath}`);
    return;
  }
  
  // Update the file's modification time
  const now = new Date();
  try {
    fs.utimesSync(filePath, now, now);
    console.log(`Successfully touched ${filePath}`);
  } catch (error) {
    console.error(`Error touching file ${filePath}: ${error}`);
    
    // Fallback to using the touch command
    exec(`touch ${filePath}`, (error) => {
      if (error) {
        console.error(`Error using touch command on ${filePath}: ${error}`);
      } else {
        console.log(`Successfully touched ${filePath} using touch command`);
      }
    });
  }
}

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Webhook service is running',
    config: {
      port: PORT,
      repoPath: REPO_PATH,
      gitBranch: GIT_BRANCH,
      touchPaths: TOUCH_PATHS,
      nodemonRestartCmd: NODEMON_RESTART_CMD,
      debug: DEBUG
    }
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Webhook service running on http://0.0.0.0:${PORT}`);
  
  if (process.env.GITPOD_WORKSPACE_URL) {
    const gitpodUrl = process.env.GITPOD_WORKSPACE_URL.replace('https://', `https://${PORT}-`);
    console.log(`Webhook public URL: ${gitpodUrl}/webhook`);
  }
});
