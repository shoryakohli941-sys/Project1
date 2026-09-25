# Supabase 24/7 Hosting Guide

Vercel is fantastic for hosting the frontend (HTML/CSS/JS) of LinkUp. However, because Vercel is "serverless", it cannot host a permanent database like PocketBase natively without paying for expensive 24/7 containers elsewhere.

**Supabase** is an open-source Firebase alternative based on PostgreSQL. It is natively supported by Vercel, perfect for serverless environments, and has a very generous **100% free tier that does NOT require a credit card**.

Follow these steps to set up your free Supabase backend:

## Step 1: Create a Supabase Project
1. Go to [Supabase.com](https://supabase.com/) and click **Start your project**.
2. Sign in with GitHub or your email (no credit card required).
3. Click **New Project** and select a default organization.
4. Name your project (e.g., `linkup-db`), generate a secure password (save it somewhere just in case), and choose a region close to you.
5. Click **Create new project**. It will take about 2-3 minutes to set up your database.

## Step 2: Disable Email Confirmations (Crucial for LinkUp)
By default, Supabase requires users to confirm their email before they can log in. Since LinkUp creates the user's profile immediately on the frontend after signup, we need to disable this.

1. Go to **Authentication** in the left sidebar menu of your Supabase dashboard.
2. Under "Configuration", click **Providers**.
3. Click the **Email** provider.
4. **Turn off "Confirm email"** and click **Save**.

## Step 3: Initialize Your Database Schema
Because Supabase uses PostgreSQL, we need to create the tables for our users, events, and opportunities. I have written the exact SQL script for this.

1. Once your project is ready, look at the left sidebar menu in the Supabase Dashboard and click on **SQL Editor** (the `{}` icon).
2. Click **New Query**.
3. Open the `supabase-schema.sql` file located in your LinkUp repository.
4. Copy all the text inside `supabase-schema.sql`.
5. Paste it into the Supabase SQL Editor.
6. Click the green **Run** button at the bottom right. You should see a "Success" message. Your tables and security policies are now created!

## Step 4: Get Your API Keys
We need to connect your frontend code to this new database.

1. In the Supabase Dashboard, click the **Settings** gear icon at the bottom of the left sidebar.
2. Under "Configuration" in the settings menu, click **API**.
3. You will see your **Project URL** (e.g., `https://xyz.supabase.co`). Copy it.
4. Below that, in the "Project API keys" section, you will see your **`anon` / `public`** key. Copy it as well. *(Never copy the `service_role` key).*

## Step 5: Connect LinkUp
1. Open `js/supabase.js` in your code editor.
2. Find `YOUR_SUPABASE_URL` and replace it with the Project URL you copied.
3. Find `YOUR_SUPABASE_ANON_KEY` and replace it with the `anon` key you copied.
4. Save the file.

## Step 6: Deploy to Vercel
1. Commit your changes.
2. Push your code to GitHub.
3. Vercel will automatically redeploy your site.
4. Your application is now securely connected to Supabase and will work 24/7!
