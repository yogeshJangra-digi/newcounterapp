# Counter Backend

A simple Node.js Express server that manages a counter state.

## API Endpoints

- `GET /api/counter` - Get the current counter value
- `POST /api/counter/increment` - Increment the counter
- `POST /api/counter/decrement` - Decrement the counter
- `POST /api/counter/reset` - Reset the counter to zero
- `GET /health` - Health check endpoint

## Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file with the following variables:
```
PORT=3001
```

## Running

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on http://localhost:3001 by default.