# Backend Docker Container on Gitpod

This document explains how to run and develop the backend service in a Docker container on Gitpod with volume mounts.

## Quick Start

1. Click the button below to start a new Gitpod workspace:

   [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/yourusername/your-repo)

2. Gitpod will automatically:
   - Build the Docker image for the backend
   - Start the backend container with volume mounts
   - Expose the backend on port 3001

3. The backend API will be available at:
   - Inside Gitpod: http://localhost:3001
   - Public URL: https://3001-yourusername-yourrepo-xxxx.gitpod.io

## How Volume Mounts Work

The Docker container is configured with two volume mounts:

1. **Source code mount**: Maps your local `packages/backend` directory to `/app` in the container
   - Any changes you make to the source code are immediately available inside the container

2. **Node modules mount**: Maps a named volume `backend-node-modules` to `/app/node_modules` in the container
   - This prevents your local node_modules from overriding the container's node_modules
   - Ensures dependencies installed in the container are preserved

## Development Workflow

1. Make changes to your backend code in Gitpod
2. The changes are automatically detected by nodemon inside the container
3. The server restarts automatically
4. Test your changes using the API endpoints

## Docker Commands

Here are some useful Docker commands for managing your container:

```bash
# View container logs
docker logs -f counter-backend

# Restart the container
docker restart counter-backend

# Stop the container
docker stop counter-backend

# Remove the container
docker rm counter-backend

# Rebuild the image
docker build -t counter-backend ./packages/backend

# Start a new container (if stopped)
docker run --name counter-backend \
  -p 3001:3001 \
  -v $(pwd)/packages/backend:/app \
  -v backend-node-modules:/app/node_modules \
  -e PORT=3001 \
  -e NODE_ENV=development \
  -e GITPOD_WORKSPACE_URL=${GITPOD_WORKSPACE_URL} \
  --rm \
  -d \
  counter-backend
```

## Connecting Your Frontend

To connect your local frontend to the Gitpod backend:

1. Get the public URL of your Gitpod workspace (https://3001-yourusername-yourrepo-xxxx.gitpod.io)
2. Set your frontend's `.env` file:
   ```
   REACT_APP_API_URL=https://3001-yourusername-yourrepo-xxxx.gitpod.io/api
   ```
3. Run your frontend locally