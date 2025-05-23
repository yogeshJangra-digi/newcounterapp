# Gitpod Webhook Setup for Auto-Updates

This guide explains how to set up a GitHub webhook to automatically update your Gitpod workspace when you push new commits to your repository.

## How It Works

1. You push a commit to your GitHub repository
2. GitHub sends a webhook event to your Gitpod workspace
3. The webhook service in your Gitpod workspace pulls the latest changes
4. Nodemon detects the file changes and automatically restarts the backend service
5. Your changes are immediately reflected without rebuilding the Docker container

## Setup Instructions

### 1. Start Your Gitpod Workspace

Open your repository in Gitpod. The webhook service will automatically start and print its URL to the console.

### 2. Configure GitHub Webhook

1. Go to your GitHub repository
2. Click on "Settings" > "Webhooks" > "Add webhook"
3. Configure the webhook:
   - **Payload URL**: Use the webhook URL printed in the Gitpod console (looks like `https://3002-yourgitpodworkspace.gitpod.io/webhook`)
   - **Content type**: `application/json`
   - **Secret**: Use the same secret defined in `webhook-service.js` (default is 'your-webhook-secret')
   - **Events**: Select "Just the push event"
   - Click "Add webhook"

### 3. Test the Webhook

1. Make a change to your repository and push it to GitHub
2. Check the Gitpod console for the webhook service to see if it received the event
3. Verify that the changes were pulled and the backend service restarted

## Troubleshooting

- **Webhook not receiving events**: Make sure your Gitpod workspace is running and the webhook URL is correct
- **Changes not being applied**: Check the webhook service logs to ensure the `git pull` command is executing successfully
- **Backend not restarting**: Verify that nodemon is running with the `--legacy-watch` flag and is properly monitoring your files

## Security Considerations

- The webhook service verifies the GitHub signature to ensure the request is legitimate
- For additional security, you can change the webhook secret in `webhook-service.js` and update it in your GitHub webhook settings

## Notes

- This setup works best for long-running Gitpod workspaces
- If you restart your Gitpod workspace, you'll need to update the webhook URL in GitHub
- For temporary workspaces, you may prefer to manually pull changes or create new workspaces
