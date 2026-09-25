# PocketBase 24/7 Hosting Guide (Fly.io)

Vercel is fantastic for hosting the frontend (HTML/CSS/JS) of LinkUp. However, Vercel is a "serverless" environment, which means it cannot run a permanent database server like PocketBase (which relies on local SQLite storage).

Because of this, if you try to log in on the Vercel-hosted version of the site, it fails because it cannot reach the PocketBase server running on your local PC (which is turned off, or not accessible over the internet).

To fix this, we need to host PocketBase on a server that runs 24/7. **Fly.io** provides a generous free tier perfect for hosting a lightweight database like PocketBase.

Follow these steps to get your database online permanently:

## Step 1: Create a Fly.io Account & Install Flyctl
1. Go to [Fly.io](https://fly.io/) and sign up for a free account.
2. Install the Fly.io command-line tool (`flyctl`) on your computer.
   - **Windows:** Open PowerShell and run: `pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"`
   - **Mac/Linux:** Open terminal and run: `curl -L https://fly.io/install.sh | sh`
3. Once installed, log in by running this command in your terminal: `fly auth login`

## Step 2: Set up PocketBase on Fly.io
You don't even need to write any backend code. We will use a pre-built template.

1. Open your terminal and create a new empty folder on your computer for the database: `mkdir linkup-fly-db`
2. Navigate into that folder: `cd linkup-fly-db`
3. Run the following command to initialize the app: `fly launch --image muchobien/pocketbase:latest --name linkup-db-yourname --region ams --no-deploy`
   *(Note: Replace `linkup-db-yourname` with a unique name, and you can change `ams` to a region closer to you like `iad` for Washington DC, or `sjc` for California).*
4. Fly.io needs persistent storage so your database doesn't reset when it restarts. Run this to create a 1GB free volume:
   `fly volumes create pb_data --region ams --size 1` (Use the same region you used above).
5. Open the `fly.toml` file that was generated in your folder, and add the following lines at the bottom so Fly knows to use the volume:
   ```toml
   [mounts]
     source = "pb_data"
     destination = "/pb_data"
   ```
6. Now, deploy it! Run: `fly deploy`
7. Once deployed, Fly will give you a live URL. It usually looks like: `https://linkup-db-yourname.fly.dev`

## Step 3: Set Up the Database Schema
1. Open your new Fly.io URL in a browser and go to the admin page: `https://linkup-db-yourname.fly.dev/_/`
2. Since this is a new instance, it will ask you to create an **admin email and password**. Do this and log in.
3. You now need to set up the collections (tables) for LinkUp. Fortunately, the schema is saved in the code!
4. In the Admin UI, go to **Settings** (the gear icon on the left) -> **Import collections**.
5. Open the `pocketbase-collections.json` file located in the root of the LinkUp repository, copy all the text inside it, and paste it into the import box.
6. Click **Import**.
7. *Important:* Make sure you also update the `users` collection to include the fields required by the app: `role` (Select: `brand`, `event_planner`), `organization_name`, `location`, `category`, and `description`. (These are documented in the main `README.md`).

## Step 4: Connect LinkUp to the 24/7 Database
Now that your database is live on the internet, you need to tell your code to talk to it instead of your local PC.

1. Open `js/pocketbase.js` in your code editor.
2. Find the spot that says `const LIVE_URL = "YOUR_FLY_IO_URL_HERE";`.
3. Replace `"YOUR_FLY_IO_URL_HERE"` with the URL you got from Fly.io in Step 2 (e.g., `"https://linkup-db-yourname.fly.dev"`).
4. Save the file.

## Step 5: Deploy
1. Commit your changes to `js/pocketbase.js`.
2. Push your code to GitHub.
3. Vercel will automatically redeploy your site.
4. Go to your Vercel website, and login/signup should now work perfectly 24/7!
