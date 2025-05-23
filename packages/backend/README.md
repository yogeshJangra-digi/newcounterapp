# Counter Monorepo

A simple monorepo containing a React frontend and Node.js backend for a counter application.

## Project Structure

```
counter-monorepo/
├── docker-compose.yml
├── docker-compose.prod.yml
├── package.json
├── packages/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── Dockerfile.prod
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.js
│   │       └── controllers/
│   │           └── counterController.js
│   └── frontend/
│       ├── Dockerfile
│       ├── Dockerfile.prod
│       ├── nginx.conf
│       ├── package.json
│       ├── public/
│       │   └── index.html
│       └── src/
│           ├── App.js
│           ├── App.css
│           ├── index.js
│           ├── index.css
│           └── components/
│               ├── Counter.js
│               └── Counter.css
```

## Development with Docker

### Start the Development Environment

```bash
docker-compose up -d
```

This will:
- Start both frontend and backend services
- Mount your local code into the containers
- Enable hot-reloading for both services

### View Logs

```bash
docker-compose logs -f
```

### Stop the Development Environment

```bash
docker-compose down
```

## Real-time Development Workflow

1. Make changes to your code locally
2. The changes will be automatically detected
3. Frontend changes will trigger a hot reload
4. Backend changes will restart the Node.js server via nodemon

No need to rebuild Docker images or restart containers!

## Production Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## CI/CD Pipeline

The GitHub Actions workflow will:
1. Build Docker images for both services
2. Push the images to Docker Hub
3. Deploy to your environment

For development environments, code changes are reflected in real-time through volume mounts.
