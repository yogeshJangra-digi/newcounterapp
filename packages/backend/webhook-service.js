const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.WEBHOOK_PORT || 3002;
const SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

app.post('/webhook', (req, res) => {
  
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);

  // Verify webhook signature if provided
  if (signature) {
    const hmac = crypto.createHmac('sha256', SECRET);
    const calculatedSignature = 'sha256=' + hmac.update(payload).digest('hex');

    if (signature !== calculatedSignature) {
      console.log('Invalid webhook signature');
      return res.status(403).send('Invalid signature');
    }
  } else {
    console.log('No signature provided, skipping verification (useful for testing)');
  }

  console.log('Received webhook...');

  // For local testing, we'll skip the git pull and just simulate a file change
  if (req.query.test === 'true') {
    console.log('Test mode: Skipping git pull');

    // Simulate a file change to trigger nodemon
    const testFilePath = process.env.GITPOD_WORKSPACE_URL
      ? '/workspace/syncPOC/packages/backend/src/index.js'
      : './src/index.js';

    exec(`touch ${testFilePath}`, (touchError) => {
      if (touchError) {
        console.error(`Error touching file: ${touchError}`);
        return res.status(500).send('Error simulating file change');
      } else {
        console.log(`Touched ${testFilePath} to trigger nodemon restart`);
        return res.status(200).send('Simulated file change to trigger restart');
      }
    });
    return;
  }

  // In production/Gitpod, pull the latest changes
  console.log('Pulling latest changes...');
  const gitCommand = process.env.GITPOD_WORKSPACE_URL
    ? 'cd /workspace/syncPOC && git pull'
    : 'git pull';

  exec(gitCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error pulling changes: ${error}`);
      return res.status(500).send('Error pulling changes');
    }

    console.log(`Git pull output: ${stdout}`);
    console.log('Changes pulled successfully, nodemon will detect changes and restart');

    res.status(200).send('Changes pulled successfully');
  });
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Webhook service is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Webhook service running on http://0.0.0.0:${PORT}`);

  if (process.env.GITPOD_WORKSPACE_URL) {
    const gitpodUrl = process.env.GITPOD_WORKSPACE_URL.replace('https://', 'https://3002-');
    console.log(`Webhook public URL: ${gitpodUrl}/webhook`);
  }
});
