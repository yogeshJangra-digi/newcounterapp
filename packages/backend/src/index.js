const express = require('express');
const cors = require('cors');
const counterController = require('./controllers/counterController');

// Load environment variables if dotenv is installed
try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not installed, using default environment variables');
}

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-production-frontend.com'
    : '*'
}));
app.use(express.json());

// Routes
app.get('/api/counter', counterController.getCounter);
app.post('/api/counter/increment', counterController.incrementCounter);
app.post('/api/counter/decrement', counterController.decrementCounter);
app.post('/api/counter/reset', counterController.resetCounter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Volume mounting is working!',
    timestamp: new Date().toISOString()
  });
});

// Add an info endpoint to show the Gitpod workspace URL
app.get('/info', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    gitpodWorkspace: process.env.GITPOD_WORKSPACE_URL || 'Not running on Gitpod'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);

  if (process.env.GITPOD_WORKSPACE_URL) {
    const gitpodUrl = process.env.GITPOD_WORKSPACE_URL.replace('https://', 'https://3001-');
    console.log(`Gitpod public URL: ${gitpodUrl}`);
  }
});

