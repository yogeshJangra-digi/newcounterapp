# Local Development with Docker

This guide explains how to run the backend container locally with volume mounting before deployment to Gitpod.

## Prerequisites

- Docker and Docker Compose installed on your local machine
- Node.js installed (for running npm commands outside Docker if needed)

## Running the Backend Container Locally

1. Make sure you're in the project root directory
2. Run the following command to start the backend container:

```bash
# Using the script
./run-local.sh

# Or directly with Docker Compose
docker-compose up --build
```

3. The backend will be available at http://localhost:3001

## Volume Mounting

The Docker Compose configuration includes volume mounting for the backend:

- `./packages/backend:/app` - Mounts the backend source code directory to the container
- `backend-node-modules:/app/node_modules` - Uses a named volume for node_modules to avoid overwriting container dependencies

This setup allows you to make changes to the backend code on your local machine, and they will be immediately reflected in the running container thanks to nodemon.

## Stopping the Container

To stop the running container, press `Ctrl+C` in the terminal where it's running.

To stop and remove the containers, networks, and volumes:

```bash
docker-compose down
```

## Deploying to Gitpod

When you're ready to deploy to Gitpod, the `.gitpod.yml` file is already configured to use the `gitpod-docker-compose.yml` file, which has a similar configuration adapted for the Gitpod environment.
