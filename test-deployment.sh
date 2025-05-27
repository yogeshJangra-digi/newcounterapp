#!/bin/bash

# Test script for EC2 deployment
# This script tests the deployed backend and webhook services

set -e

# Configuration
EC2_HOST="ec2-15-206-100-79.ap-south-1.compute.amazonaws.com"
KEY_FILE="devops-poc.pem"
EC2_IP="15.206.100.79"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}


print_status "EC2 Public IP: $EC2_IP"

print_header "Testing Deployed Services"

# Test webhook health endpoint
print_status "Testing webhook health endpoint..."
if curl -s "http://$EC2_IP:3002/health" > /dev/null; then
    print_status "✓ Webhook service is healthy"
    echo "Webhook health response:"
    curl -s "http://$EC2_IP:3002/health" | jq . 2>/dev/null || curl -s "http://$EC2_IP:3002/health"
    echo ""
else
    print_error "✗ Webhook service is not responding"
fi

# Test backend endpoint
print_status "Testing backend endpoint..."
if curl -s "http://$EC2_IP:3001" > /dev/null; then
    print_status "✓ Backend service is responding"
    echo "Backend response:"
    curl -s "http://$EC2_IP:3001" 2>/dev/null || echo "Backend is running but may not have a root endpoint"
    echo ""
else
    print_error "✗ Backend service is not responding"
fi

# Test webhook endpoint with test payload
print_status "Testing webhook endpoint with test payload..."
webhook_response=$(curl -s -X POST "http://$EC2_IP:3002/webhook?test=true" \
    -H "Content-Type: application/json" \
    -d '{"test": true}' || echo "Failed")

if [ "$webhook_response" != "Failed" ]; then
    print_status "✓ Webhook test successful"
    echo "Webhook response: $webhook_response"
else
    print_error "✗ Webhook test failed"
fi

print_header "Service URLs"
echo "Backend API: http://$EC2_IP:3001"
echo "Webhook Service: http://$EC2_IP:3002"
echo "Webhook Health: http://$EC2_IP:3002/health"
echo "GitHub Webhook URL: http://$EC2_IP:3002/webhook"

print_header "Next Steps"
echo "1. Update your GitHub webhook URL to: http://$EC2_IP:3002/webhook"
echo "2. Make sure your EC2 security group allows inbound traffic on ports 3001 and 3002"
echo "3. Test by making a commit to your repository"
echo "4. Monitor logs with: ./manage-backend.sh logs"
