FROM node:18-alpine

WORKDIR /app

# Install git and other dependencies
RUN apk add --no-cache git

# Configure git to trust the workspace directory
RUN git config --global --add safe.directory /workspace
RUN git config --global --add safe.directory '*'

# Install Node.js dependencies
RUN npm install express crypto

# Copy the webhook service code
COPY webhook-service.js .

# Environment variables with defaults
ENV WEBHOOK_PORT=3002
ENV WEBHOOK_SECRET=your-webhook-secret
ENV REPO_PATH=/workspace
ENV GIT_BRANCH=main
ENV DEBUG=false

# Expose the webhook port
EXPOSE 3002

# Start the webhook service
CMD ["node", "webhook-service.js"]
