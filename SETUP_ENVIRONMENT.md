# KSLU Intercollegiate Sports Portal - Environment Setup Guide

This guide walks you through setting up the 100% free accounts required for the portal to function, and exactly how to find the API keys needed for the code.

---

## 1. Supabase (Database & Authentication) - Free Tier
Supabase provides the PostgreSQL database and user login system. It is free for up to 50,000 monthly active users.

### How to make an account & get keys:
1. Go to [Supabase.com](https://supabase.com/) and click **Start your project**.
2. Sign up using a GitHub or Google account.
3. Click **New Project** and select your organization.
4. Fill in the project details:
   * **Name:** `kslu-sports-portal`
   * **Database Password:** Generate a strong password. Save this somewhere safe (you need it if you ever want to connect directly to the database via a tool, but it's not needed for the portal code).
   * **Region:** Select **South Asia (Mumbai)** or **Southeast Asia (Singapore)** (whichever is available).
5. Click **Create new project**. (It will take about 2-3 minutes to set up the database).
6. Once the dashboard loads, look at the left-hand menu and click on the ⚙️ **Project Settings** (the gear icon at the bottom).
7. In the Settings menu, click on **API**.
8. **Copy your keys:**
   * **URL:** Under "Project URL", copy the URL.
   * **anon / public:** Under "Project API keys", copy this key.
   * **service_role:** Just below the anon key, click **Reveal** and copy this key. *(Keep this strictly secret).*

---

## 2. Gmail SMTP (Email Sending) - Free
Instead of a paid email service, the portal will connect directly to your KSLU Gmail account to send out automated receipts and PDF proformas.

### How to set up and get the App Password:
1. Ensure you are logged into the admin email account: `kslu.physicaldirector@gmail.com`.
2. Go to your Google Account management page: [myaccount.google.com](https://myaccount.google.com/).
3. On the left sidebar, click on **Security**.
4. Scroll down to the "How you sign in to Google" section. 
5. You must ensure **2-Step Verification** is turned **ON**. If it is off, click it and follow Google's steps to link your phone number.
6. Once 2-Step Verification is ON, use the search bar at the very top of the Google Account page and search for **"App passwords"**. Click on the result.
7. In the "App name" box, type `KSLU Sports Portal` and click **Create**.
8. Google will generate a 16-letter password in a yellow box (e.g., `abcd efgh ijkl mnop`).
9. **Copy this 16-letter password**. (You do not need to copy the spaces). You won't be able to see it again after closing the window.

---

## 3. Cloudflare Turnstile (Security / CAPTCHA) - Free
Turnstile is a free alternative to Google reCAPTCHA that stops bots without making users solve annoying picture puzzles.

### How to make an account & get keys:
1. Go to the [Cloudflare Turnstile page](https://dash.cloudflare.com/sign-up/turnstile) and sign up for a free account.
2. In the Turnstile dashboard, click the **Add Site** button.
3. Fill in the details:
   * **Site name:** `KSLU Sports Portal`
   * **Domain:** Enter `localhost` for now (this allows it to work on our computers while building). Later, you will add your real domain (like `kslu.ac.in`).
   * **Widget Mode:** Select **Managed**.
4. Click **Create**.
5. **Copy your keys:** The next screen will show you a **Site Key** and a **Secret Key**. Copy both of them.

---

## 4. The `.env.local` File

Once you have gathered all the keys above, you need to create a file named exactly `.env.local` in the root folder of this codebase. 

Copy the text below, paste it into that `.env.local` file, and replace all the `<PLACEHOLDERS>` with the actual keys you just copied.

```env
