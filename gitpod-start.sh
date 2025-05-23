#!/bin/bash

# Make script executable
chmod +x gitpod-start.sh

# Function to check if container exists
container_exists() {
  docker ps -a --format '{{.Names}}' | grep -q "^$1$"
}

# Function to check if container is running
container_running() {
  docker ps --format '{{.Names}}' | grep -q "^$1$"
}

# Stop and remove existing container if it exists
if container_exists "counter-backend"; then
  echo "Stopping and removing existing container..."
  docker stop counter-backend
  docker rm counter-backend
fi

# Build the backend image
echo "Building backend Docker image..."
cd packages/backend
docker build -t counter-backend .

# Run the backend container with volume mounts
echo "Starting backend container with volume mounts..."
docker run --name counter-backend \
  -p 3001:3001 \
  -v $(pwd):/app \
  -v backend-node-modules:/app/node_modules \
  -e PORT=3001 \
  -e NODE_ENV=development \
  -e GITPOD_WORKSPACE_URL=${GITPOD_WORKSPACE_URL} \
  --rm \
  -d \
  counter-backend

# Print the Gitpod URL
if [ -n "$GITPOD_WORKSPACE_URL" ]; then
  BACKEND_URL=$(echo $GITPOD_WORKSPACE_URL | sed 's|https://|https://3001-|')
  echo "Backend is running at: $BACKEND_URL"
  echo "API endpoints:"
  echo "- Counter: $BACKEND_URL/api/counter"
  echo "- Health: $BACKEND_URL/health"
  echo "- Info: $BACKEND_URL/info"
fi

# Follow the logs
echo "Following container logs (Ctrl+C to stop following, container will keep running):"
docker logs -f counter-backend