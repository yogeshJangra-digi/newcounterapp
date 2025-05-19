# Counter Frontend

A React application that displays and controls a counter managed by the backend.

## Features

- Display current counter value
- Increment, decrement, and reset the counter
- Error handling for backend connectivity issues

## Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file with the following variables:
```
PORT=3000
REACT_APP_API_URL=http://localhost:3001/api
```

## Running

```bash
npm start
```

The application will run on http://localhost:3000 by default.

Note: The backend server must be running for the counter to work properly.