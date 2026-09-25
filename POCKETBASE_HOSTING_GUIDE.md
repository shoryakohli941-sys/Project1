# PocketBase 24/7 Hosting Guide

Vercel is fantastic for hosting the frontend (HTML/CSS/JS) of LinkUp. However, Vercel is a "serverless" environment, which means it cannot run a permanent database server like PocketBase (which relies on local SQLite storage).

Because of this, if you try to log in on the Vercel-hosted version of the site, it fails because it cannot reach the PocketBase server running on your local PC (which is turned off, or not accessible over the internet).

To fix this, we need to host PocketBase on a server that runs 24/7. **PocketHost.io** is a free, easy-to-use service built specifically for this.

Follow these steps to get your database online permanently:

## Step 1: Create a PocketHost Project
1. Go to [PocketHost.io](https://pockethost.io/) and create a free account.
2. Once logged in, click **Create Project**.
3. Give your project a name (e.g., `linkup-db`).
4. PocketHost will generate a live URL for you (e.g., `https://linkup-db.pockethost.io`). **Save this URL!**

## Step 2: Set Up the Database
1. Click on the URL provided by PocketHost. It will open your live PocketBase admin interface.
2. Since this is a new instance, it will ask you to create an **admin email and password**. Do this and log in.
3. You now need to set up the collections (tables) for LinkUp. Fortunately, the schema is saved in the code!
4. In the Admin UI, go to **Settings** (the gear icon on the left) -> **Import collections**.
5. Open the `pocketbase-collections.json` file located in the root of the LinkUp repository, copy all the text inside it, and paste it into the PocketHost import box.
6. Click **Import**.
7. *Important:* Make sure you also update the `users` collection to include the fields required by the app: `role` (Select: `brand`, `event_planner`), `organization_name`, `location`, `category`, and `description`. (These are documented in the main `README.md`).

## Step 3: Connect LinkUp to the 24/7 Database
Now that your database is live on the internet, you need to tell your code to talk to it instead of your local PC.

1. Open `js/pocketbase.js` in your code editor.
2. Find the spot that says `const LIVE_URL = "YOUR_POCKETHOST_URL_HERE";`.
3. Replace `"YOUR_POCKETHOST_URL_HERE"` with the URL you got from PocketHost in Step 1 (e.g., `"https://linkup-db.pockethost.io"`).
4. Save the file.

## Step 4: Deploy
1. Commit your changes to `js/pocketbase.js`.
2. Push your code to GitHub.
3. Vercel will automatically redeploy your site.
4. Go to your Vercel website, and login/signup should now work perfectly 24/7, regardless of whether your local PC is on!
