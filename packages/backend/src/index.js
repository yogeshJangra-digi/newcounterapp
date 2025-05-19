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

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/counter', counterController.getCounter);
app.post('/api/counter/increment', counterController.incrementCounter);
app.post('/api/counter/decrement', counterController.decrementCounter);
app.post('/api/counter/reset', counterController.resetCounter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});