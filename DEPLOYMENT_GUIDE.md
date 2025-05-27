# Backend Deployment Guide for Ubuntu EC2

This guide will help you deploy the backend service with webhook functionality to your Ubuntu EC2 instance.

## Prerequisites

1. **EC2 Instance**: Ubuntu EC2 instance running at `ec2-ip........ap-south-1.compute.amazonaws.com`
2. **SSH Key**: `devops-poc.pem` file in the project root
3. **Security Group**: EC2 security group configured to allow inbound traffic on ports 3001 and 3002

## Quick Deployment

### 1. Make scripts executable
```bash
chmod +x deploy-to-ec2.sh
chmod +x manage-backend.sh
```

### 2. Deploy to EC2
```bash
./deploy-to-ec2.sh
```

This script will:
- Install Docker and Docker Compose on EC2 (if not already installed)
- Sync your code to the EC2 instance
- Build and start the backend and webhook containers
- Display the application URLs

### 3. Verify deployment
```bash
./manage-backend.sh status
./manage-backend.sh health
```

## Application URLs

After successful deployment, your services will be available at:

- **Backend API**: `http://EC2_PUBLIC_IP:3001`
- **Webhook Service**: `http://EC2_PUBLIC_IP:3002`
- **Health Check**: `http://EC2_PUBLIC_IP:3002/health`

## GitHub Webhook Configuration

1. Go to your GitHub repository settings
2. Navigate to "Webhooks"
3. Add a new webhook with:
   - **Payload URL**: `http://EC2_PUBLIC_IP:3002/webhook`
   - **Content type**: `application/json`
   - **Secret**: Update the `WEBHOOK_SECRET` in the `.env` file on the server
   - **Events**: Select "Just the push event"

## Management Commands

Use the `manage-backend.sh` script for easy management:

```bash
# Show container status
./manage-backend.sh status

# View logs
./manage-backend.sh logs
./manage-backend.sh backend    # Backend logs only
./manage-backend.sh webhook    # Webhook logs only

# Restart services
./manage-backend.sh restart

# Update code and restart
./manage-backend.sh update

# Test webhook
./manage-backend.sh test

# Connect to EC2 shell
./manage-backend.sh shell

# Check health
./manage-backend.sh health

# Clean up Docker resources
./manage-backend.sh cleanup
```

## How It Works

### Mount Storage Functionality
- The backend code is mounted as a volume: `./packages/backend:/app`
- Node modules are stored in a separate volume to avoid conflicts
- Nodemon watches for file changes and automatically restarts the server

### Webhook Integration
- When GitHub sends a webhook, the webhook service pulls the latest code
- If no changes are detected, it touches the backend files to trigger a restart
- This ensures your deployed application stays in sync with your GitHub repository

### Hot Reloading
- The backend runs with `nodemon --legacy-watch` for file change detection
- Volume mounting ensures code changes are immediately reflected
- The webhook service can trigger restarts when GitHub commits are made

## Environment Configuration

The deployment creates a `.env` file on the server with:

```env
WEBHOOK_SECRET=your-production-webhook-secret
GIT_BRANCH=main
DEBUG=false
NODE_ENV=production
```

Update the `WEBHOOK_SECRET` to match your GitHub webhook configuration.

## Security Group Configuration

Ensure your EC2 security group allows:

- **Port 22**: SSH access (for deployment)
- **Port 3001**: Backend API access
- **Port 3002**: Webhook service access

## Troubleshooting

### Check container status
```bash
./manage-backend.sh status
```

### View logs
```bash
./manage-backend.sh logs
```

### Test webhook manually
```bash
./manage-backend.sh test
```

### Connect to server
```bash
./manage-backend.sh shell
```

### Rebuild containers
```bash
./manage-backend.sh rebuild
```

## File Structure on EC2

After deployment, your files will be organized as:

```
/home/ubuntu/syncPOC/
├── packages/
│   └── backend/
│       ├── src/
│       ├── Dockerfile
│       └── package.json
├── webhook-service/
│   ├── webhook-service.js
│   └── Dockerfile
├── docker-compose.prod.yml
└── .env
```

## Next Steps

1. Update your GitHub webhook URL to point to your EC2 instance
2. Test the webhook by making a commit to your repository
3. Monitor the logs to ensure everything is working correctly
4. Consider setting up SSL/TLS for production use
