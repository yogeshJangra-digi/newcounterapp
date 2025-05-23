# Git Webhook Service

A reusable webhook service that automatically updates your code when you push to GitHub, without rebuilding Docker containers.

## Features

- Receives GitHub webhook events
- Pulls the latest changes from your repository
- Triggers nodemon to restart your application
- Works with any project structure
- Configurable via environment variables
- Runs in its own container

## Quick Start

### Option 1: Include in Your Docker Compose File

Add this to your `docker-compose.yml`:

```yaml
services:
  # Your existing services...
  
  webhook:
    image: yourusername/webhook-service:latest
    ports:
      - "3002:3002"
    environment:
      - WEBHOOK_SECRET=your-webhook-secret
      - REPO_PATH=/workspace
      - GIT_BRANCH=main
      - TOUCH_PATHS=src/index.js,server.js
    volumes:
      - .:/workspace
```

### Option 2: Use Docker Compose Extension

1. Create a `docker-compose.override.yml` file:

```yaml
include:
  - https://raw.githubusercontent.com/yourusername/webhook-service/main/docker-compose.webhook.yml
```

2. Run your services:

```bash
docker-compose up
```

## Setting Up GitHub Webhooks

1. Go to your GitHub repository
2. Click on "Settings" > "Webhooks" > "Add webhook"
3. Configure the webhook:
   - **Payload URL**: Your webhook URL (e.g., `https://your-server:3002/webhook`)
   - **Content type**: `application/json`
   - **Secret**: The same secret you set in `WEBHOOK_SECRET`
   - **Events**: Select "Just the push event"
   - Click "Add webhook"

## Configuration

The webhook service can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `WEBHOOK_PORT` | Port to listen on | `3002` |
| `WEBHOOK_SECRET` | Secret for GitHub webhook verification | `your-webhook-secret` |
| `REPO_PATH` | Path to the repository inside the container | `/workspace` |
| `GIT_BRANCH` | Branch to watch for changes | `main` |
| `TOUCH_PATHS` | Comma-separated list of files to touch | `` |
| `NODEMON_RESTART_CMD` | Custom command to restart nodemon | `` |
| `DEBUG` | Enable debug logging | `false` |

## Testing

You can test the webhook service without GitHub by sending a POST request:

```bash
curl -X POST "http://localhost:3002/webhook?test=true" \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

## Local Development with ngrok

For local development, you can use ngrok to expose your webhook service:

1. Install ngrok: https://ngrok.com/download
2. Run ngrok: `ngrok http 3002`
3. Use the ngrok URL as your GitHub webhook URL

## Gitpod Integration

In your `.gitpod.yml` file:

```yaml
tasks:
  - name: Start Services
    command: docker-compose up
    
ports:
  - port: 3002
    onOpen: ignore
    visibility: public
```

## Building the Docker Image

```bash
cd webhook-service
docker build -t yourusername/webhook-service:latest .
docker push yourusername/webhook-service:latest
```

## License

MIT
