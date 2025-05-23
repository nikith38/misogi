# Deploying MentorHub to Render

This guide explains how to deploy the MentorHub application to Render.

## Prerequisites

- A Render account (https://render.com)
- A GitHub repository with your MentorHub code

## Deployment Steps

### 1. Push Your Code to GitHub

Make sure your code is in a GitHub repository that Render can access.

### 2. Create a New Web Service on Render

1. Log in to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `mentorhub` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### 3. Configure Environment Variables

Add the following environment variables in the Render dashboard:
- `NODE_ENV`: `production`
- `DATABASE_URL`: Your Neon database URL (or create a new Render PostgreSQL database)
- `SESSION_SECRET`: A secure random string (or let Render generate one)

### 4. Deploy

Click "Create Web Service" and Render will automatically deploy your application.

## Alternative: Using render.yaml

This repository includes a `render.yaml` file that can be used for Blueprint deployments:

1. In your Render dashboard, go to "Blueprints"
2. Click "New Blueprint Instance"
3. Connect to your repository
4. Render will automatically detect the `render.yaml` file and set up the services

## Database Migration

If you're using a new database, you'll need to run migrations:

1. After deployment, go to your web service in the Render dashboard
2. Click "Shell"
3. Run: `npm run db:migrate`

## Troubleshooting

- Check the logs in your Render dashboard for any errors
- Ensure your database is accessible from Render
- Verify that all environment variables are correctly set
- If you encounter CORS issues, check that the SESSION_SECRET is properly set
- For session issues, verify that 'trust proxy' is enabled in the Express app

## Monitoring

The application includes a health check endpoint at `/api/health` that Render uses to monitor the application's status.

## Important Notes

- The application is configured to use PostgreSQL for session storage in production
- The application is configured to use secure cookies in production
- The application is configured to use the PORT environment variable provided by Render
