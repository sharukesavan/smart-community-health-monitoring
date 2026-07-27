# Deployment Guide for Render

This guide walks you through deploying the **Smart Community Health Monitoring and Early Warning System** to **Render** (render.com). 

Out of the box, the application runs **100% database-free in-memory**. This makes deployment extremely quick and requires no databases to be provisioned.

---

## Option 1: One-Click Deploy using Render Blueprints (Recommended)

Render Blueprints use the pre-configured `render.yaml` file in this repository to set up everything automatically.

### Step 1: Push Code to GitHub / GitLab
Make sure this project is in a repository on your GitHub or GitLab account:
1. Initialize git (if not already): `git init`
2. Add files: `git add .`
3. Commit changes: `git commit -m "Configure deployment"`
4. Push to your remote repository.

### Step 2: Create a Blueprint on Render
1. Go to the [Render Dashboard](https://dashboard.render.com).
2. Click **New** (top right) and select **Blueprint**.
3. Connect your GitHub/GitLab account and select your project repository.
4. Render will read the `render.yaml` file and show a list of resources to create:
   - **Web Service**: `smart-community-health-monitoring`
5. Click **Apply**.
6. Render will automatically:
   - Set up the Node environment.
   - Run `npm install` to load dependencies.
   - Start the server using `node server.js`.
   - Generate a secure random string for `SESSION_SECRET` in your environment variables.

Once the build is complete, Render will provide your public URL (e.g., `https://smart-community-health-monitoring.onrender.com`).

---

## Option 2: Manual Web Service Setup on Render

If you prefer not to use Blueprints, you can configure the Web Service manually.

### Step 1: Connect your Repository
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New** -> **Web Service**.
3. Select your repository.

### Step 2: Configure Service Settings
Fill in the following fields:
* **Name**: `smart-community-health-monitoring`
* **Region**: Select a region close to your target users (e.g., `Singapore` or `Oregon`).
* **Branch**: `main` (or whichever branch you pushed your code to).
* **Runtime**: `Node`
* **Build Command**: `npm install`
* **Start Command**: `node server.js`
* **Instance Type**: `Free`

### Step 3: Add Environment Variables
Scroll down and click **Advanced** -> **Add Environment Variable**:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `PORT` | `3000` | Web port used by Express |
| `NODE_ENV` | `production` | Sets Node to production environment |
| `SESSION_SECRET` | *[Choose a secure random password]* | Encrypts session cookies |

Click **Create Web Service**. Your application will start building and will be live within a few minutes.

---

## ⚠️ Notes for Free Tier Hosting

* **Cold Starts**: Render's free tier spins down services after 15 minutes of inactivity. When a new request arrives, it may take 30–50 seconds for the service to wake up.
* **In-Memory Data Reset**: Because this app runs in-memory by default, any newly submitted reports, registered villages, or resolved alerts will be cleared when the Render instance restarts or goes to sleep. This is perfectly normal for demonstration prototypes.
