# PocketBase 24/7 Hosting Guide (Hugging Face Spaces)

Vercel is fantastic for hosting the frontend (HTML/CSS/JS) of LinkUp. However, Vercel is a "serverless" environment, which means it cannot run a permanent database server like PocketBase (which relies on local SQLite storage).

Because of this, if you try to log in on the Vercel-hosted version of the site, it fails because it cannot reach the PocketBase server running on your local PC.

To fix this, we need to host PocketBase on a server that runs 24/7. **Hugging Face Spaces** provides a completely free way to host a Docker container with persistent storage, and **it does not require a credit card**.

Follow these steps to get your database online permanently:

## Step 1: Configure Your Hugging Face Space
You should already be on the "Create a new Space" page on [Hugging Face](https://huggingface.co/spaces). Fill it out exactly like this:

1. **Space name:** Type `linkup-db` (or anything you want).
2. **License:** Select `mit` (or leave blank).
3. **Select the Space SDK:** Click on **Docker**.
4. **Choose a Docker template:** Select **Blank**.
5. **Space hardware:** Keep it on `Free`.
6. Click **Create Space**.

## Step 2: Set Up Persistent Storage (Crucial!)
If you skip this, your database will reset every time the server restarts!

1. On your new Space page, click on **Settings** (the gear icon near the top right).
2. Scroll down to the **Persistent Storage** section.
3. Click **Upgrade to persistent storage**. (Don't worry, the lowest tier is free and does not require a card).
4. Select **Free tier (max 10GB/mo)**.
5. Hugging Face will now mount a persistent hard drive to `/data` inside your Space.

## Step 3: Add the PocketBase Code
1. Go back to your Space's main page (click the "App" tab or the name of your space at the top).
2. Click the **Files** tab.
3. Click the **+ Add file** button, then select **Create a new file**.
4. Name the file `Dockerfile` (exactly like that, with a capital D).
5. Paste the following code into the file:

```dockerfile
FROM alpine:latest

ARG PB_VERSION=0.22.20

RUN apk add --no-cache \
    unzip \
    ca-certificates

# Download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# Expose port 8080
EXPOSE 8080

# Start PocketBase, using the /data folder provided by Hugging Face for persistent storage
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/data/pb_data"]
```

6. Click **Commit new file to main**.
7. Hugging Face will now automatically build and start your PocketBase server! It might take a minute or two. Once it says "Running" in green at the top, it's ready.

## Step 4: Find Your Live URL & Import Data
1. On your Space's main page (the "App" tab), click the three dots `...` in the very top right corner (next to the Clone repository button) and select **Embed this Space**.
2. Look at the code provided. You will see a URL that looks like `https://yourusername-linkup-db.hf.space`. **Copy this URL.**
3. Open a new browser tab and go to: `https://yourusername-linkup-db.hf.space/_/` (Make sure to add `/_/` at the end to get to the admin panel).
4. Since this is a new instance, create an **admin email and password** and log in.
5. Go to **Settings** (gear icon) -> **Import collections**.
6. Open the `pocketbase-collections.json` file in the LinkUp repository, copy all the text, and paste it into the import box, then click **Import**.
7. *Important:* Make sure you also update the `users` collection to include the fields required by the app: `role` (Select: `brand`, `event_planner`), `organization_name`, `location`, `category`, and `description`.

## Step 5: Connect LinkUp to the 24/7 Database
1. Open `js/pocketbase.js` in your code editor.
2. Find the spot that says `const LIVE_URL = "YOUR_HUGGING_FACE_URL_HERE";`.
3. Replace `"YOUR_HUGGING_FACE_URL_HERE"` with the URL you found in Step 4 (e.g., `"https://yourusername-linkup-db.hf.space"`).
4. Save the file, commit your changes, and push to GitHub. Vercel will redeploy, and your site will now work 24/7!