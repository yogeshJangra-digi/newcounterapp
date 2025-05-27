#!/bin/bash

# EC2 Backend Management Script for syncPOC Application
# This script provides easy management commands for the backend deployment

set -e

# Configuration
EC2_HOST="ubuntu@ec2-15-206-100-79.ap-south-1.compute.amazonaws.com"
KEY_FILE="devops-poc.pem"
REMOTE_DIR="/home/ubuntu/syncPOC"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if key file exists
check_key_file() {
    if [ ! -f "$KEY_FILE" ]; then
        print_error "Key file $KEY_FILE not found!"
        exit 1
    fi
    chmod 600 "$KEY_FILE"
}

# Execute command on EC2
exec_remote() {
    ssh -i "$KEY_FILE" "$EC2_HOST" "cd $REMOTE_DIR && $1"
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status      - Show container status"
    echo "  logs        - Show application logs"
    echo "  restart     - Restart all containers"
    echo "  stop        - Stop all containers"
    echo "  start       - Start all containers"
    echo "  rebuild     - Rebuild and restart containers"
    echo "  shell       - Connect to EC2 instance"
    echo "  webhook     - Show webhook logs"
    echo "  backend     - Show backend logs"
    echo "  health      - Check application health"
    echo "  update      - Update code and restart"
    echo "  cleanup     - Clean up unused Docker resources"
    echo "  test        - Test webhook endpoint"
}

# Show container status
show_status() {
    print_header "Container Status"
    exec_remote "docker-compose -f docker-compose.prod.yml ps"
}

# Show logs
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_header "All Application Logs"
        exec_remote "docker-compose -f docker-compose.prod.yml logs --tail=50"
    else
        print_header "$service Logs"
        exec_remote "docker-compose -f docker-compose.prod.yml logs --tail=50 $service"
    fi
}

# Restart containers
restart_containers() {
    print_header "Restarting Containers"
    exec_remote "docker-compose -f docker-compose.prod.yml restart"
    print_status "Containers restarted"
}

# Stop containers
stop_containers() {
    print_header "Stopping Containers"
    exec_remote "docker-compose -f docker-compose.prod.yml down"
    print_status "Containers stopped"
}

# Start containers
start_containers() {
    print_header "Starting Containers"
    exec_remote "docker-compose -f docker-compose.prod.yml up -d"
    print_status "Containers started"
}

# Rebuild containers
rebuild_containers() {
    print_header "Rebuilding Containers"
    exec_remote "docker-compose -f docker-compose.prod.yml down"
    exec_remote "docker-compose -f docker-compose.prod.yml up -d --build"
    print_status "Containers rebuilt and started"
}

# Connect to EC2 shell
connect_shell() {
    print_status "Connecting to EC2 instance..."
    ssh -i "$KEY_FILE" "$EC2_HOST"
}

# Check application health
check_health() {
    print_header "Application Health Check"

    # Get EC2 public IP
    EC2_IP=$(exec_remote "curl -s http://169.254.169.254/latest/meta-data/public-ipv4")

    echo "Testing endpoints:"
    echo "  Backend API: http://$EC2_IP:3001"
    echo "  Webhook Health: http://$EC2_IP:3002/health"

    # Test webhook health endpoint
    if curl -s "http://$EC2_IP:3002/health" > /dev/null; then
        print_status "✓ Webhook service is healthy"
    else
        print_error "✗ Webhook service is not responding"
    fi

    # Test backend endpoint (if it has a health endpoint)
    if curl -s "http://$EC2_IP:3001" > /dev/null; then
        print_status "✓ Backend service is responding"
    else
        print_error "✗ Backend service is not responding"
    fi
}

# Update code and restart
update_code() {
    print_header "Updating Code"

    # Sync files
    print_status "Syncing files..."

    # Check if rsync is available, if not use scp with tar
    if command -v rsync &> /dev/null; then
        print_status "Using rsync for file transfer..."
        rsync -avz --progress \
            --exclude 'node_modules' \
            --exclude '.git' \
            --exclude '*.log' \
            --exclude '.env' \
            --exclude 'devops-poc.pem' \
            -e "ssh -i $KEY_FILE" \
            "./" "$EC2_HOST:$REMOTE_DIR/"
    else
        print_status "rsync not found, using tar + scp for file transfer..."

        # Create a temporary tar file excluding unnecessary files
        print_status "Creating temporary archive..."
        tar --exclude='node_modules' \
            --exclude='.git' \
            --exclude='*.log' \
            --exclude='.env' \
            --exclude='devops-poc.pem' \
            -czf /tmp/syncpoc-update.tar.gz -C "." .

        # Transfer the tar file
        print_status "Transferring files..."
        scp -i "$KEY_FILE" /tmp/syncpoc-update.tar.gz "$EC2_HOST:/tmp/"

        # Extract on remote server
        print_status "Extracting files on remote server..."
        ssh -i "$KEY_FILE" "$EC2_HOST" "cd $REMOTE_DIR && tar -xzf /tmp/syncpoc-update.tar.gz && rm /tmp/syncpoc-update.tar.gz"

        # Clean up local temp file
        rm -f /tmp/syncpoc-update.tar.gz
        print_status "File transfer completed"
    fi

    # Restart containers
    restart_containers
    print_status "Code updated and containers restarted"
}

# Cleanup Docker resources
cleanup_docker() {
    print_header "Cleaning Up Docker Resources"
    exec_remote "docker system prune -f"
    exec_remote "docker volume prune -f"
    print_status "Docker cleanup completed"
}

# Test webhook endpoint
test_webhook() {
    print_header "Testing Webhook Endpoint"

    # Get EC2 public IP
    EC2_IP=$(exec_remote "curl -s http://169.254.169.254/latest/meta-data/public-ipv4")

    print_status "Testing webhook endpoint: http://$EC2_IP:3002/webhook?test=true"

    if curl -X POST "http://$EC2_IP:3002/webhook?test=true" \
        -H "Content-Type: application/json" \
        -d '{"test": true}'; then
        print_status "✓ Webhook test successful"
    else
        print_error "✗ Webhook test failed"
    fi
}

# Main script logic
check_key_file

case "${1:-}" in
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "webhook")
        show_logs "webhook"
        ;;
    "backend")
        show_logs "backend"
        ;;
    "restart")
        restart_containers
        ;;
    "stop")
        stop_containers
        ;;
    "start")
        start_containers
        ;;
    "rebuild")
        rebuild_containers
        ;;
    "shell")
        connect_shell
        ;;
    "health")
        check_health
        ;;
    "update")
        update_code
        ;;
    "cleanup")
        cleanup_docker
        ;;
    "test")
        test_webhook
        ;;
    *)
        show_usage
        ;;
esac
