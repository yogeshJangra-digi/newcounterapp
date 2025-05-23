#!/bin/bash

# Test the webhook service by sending a simulated GitHub push event
echo "Testing webhook service..."
curl -X POST "http://localhost:3002/webhook?test=true" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/main","repository":{"name":"syncPOC"}}'

echo -e "\nDone! Check the webhook service logs for details."
