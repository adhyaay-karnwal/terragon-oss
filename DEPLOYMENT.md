# Complete Deployment Guide for Terragon

This guide walks you through deploying Terragon on **Oracle Cloud Always Free** tier - completely free forever (with some caveats). Follow each step carefully.

---

## Table of Contents

1. [Overview - What You're Deploying](#overview)
2. [Create All Required Accounts](#step-1-create-accounts)
3. [Set Up Oracle Cloud (Free Server)](#step-2-oracle-cloud-setup)
4. [Configure Your Domain](#step-3-domain-setup)
5. [Create GitHub App](#step-4-github-app)
6. [Get API Keys](#step-5-api-keys)
7. [Set Up File Storage (Cloudflare R2)](#step-6-cloudflare-r2)
8. [Deploy PartyKit (WebSocket)](#step-7-partykit)
9. [Deploy the App](#step-8-deploy-app)
10. [Set Up HTTPS with Nginx](#step-9-nginx-ssl)
11. [Push Database Schema](#step-10-database-schema)
12. [How to Stay Free Forever](#staying-free)
13. [Troubleshooting](#troubleshooting)

---

## Overview

Terragon has 4 parts that need to be deployed:

| Component | What it does | Where it runs |
|-----------|-------------|---------------|
| **Web App** | Main Next.js application | Oracle Cloud VM |
| **PostgreSQL** | Database | Oracle Cloud VM (Docker) |
| **Redis** | Rate limiting & caching | Oracle Cloud VM (Docker) |
| **PartyKit** | Real-time WebSocket service | PartyKit cloud (free) |

**Total cost**: $0/month for hosting + pay-per-use AI APIs (~$5-20/month depending on usage)

---

## Step 1: Create Accounts

Create accounts on ALL of these services before proceeding:

### Required (Free)

| Service | Purpose | Sign up |
|---------|---------|---------|
| Oracle Cloud | Free server hosting | https://cloud.oracle.com |
| GitHub | OAuth login + code storage | https://github.com |
| Cloudflare | File storage (R2) + DNS | https://cloudflare.com |
| PartyKit | WebSocket service | https://partykit.io |
| Anthropic | Claude AI API | https://console.anthropic.com |
| E2B | Sandbox environments | https://e2b.dev |

### Optional but Recommended

| Service | Purpose | Sign up |
|---------|---------|---------|
| OpenAI | Commit message generation | https://platform.openai.com |
| Resend | Transactional emails | https://resend.com |
| PostHog | Analytics | https://posthog.com |

---

## Step 2: Oracle Cloud Setup

### 2.1 Sign Up for Oracle Cloud

1. Go to https://cloud.oracle.com
2. Click **"Sign Up"** (not "Sign In")
3. Fill in your details:
   - Use your real name and address
   - Use a valid credit card (they do a $1 temporary hold but **never charge** for free tier)
4. Choose your **Home Region** (pick one close to you - you can't change this later)
5. Wait for account approval (usually instant, sometimes takes hours)

### 2.2 Create the Virtual Machine

1. Log into Oracle Cloud Console
2. Click the hamburger menu (☰) → **Compute** → **Instances**
3. Click **"Create Instance"**
4. Configure:

   **Name**: `terragon` (or anything you want)

   **Image and shape**:
   - Click **"Edit"** next to "Image and shape"
   - For **Image**: Select **"Canonical Ubuntu 24.04"** (or 22.04)
   - For **Shape**: Click **"Change shape"**
     - Select **"Ampere"** (ARM processor)
     - Set **OCPUs**: `2` (or `1` for lighter usage)
     - Set **Memory**: `12 GB` (or `6 GB` for lighter)
     - **IMPORTANT**: Verify it shows **"Always Free-eligible"**

   **Networking**:
   - Use default VCN or create new one
   - Make sure "Assign a public IPv4 address" is selected

   **Add SSH keys**:
   - If you have an SSH key: Select **"Upload public key files"** and upload your `~/.ssh/id_rsa.pub`
   - If you don't: Select **"Generate a key pair for me"** and **download the private key** (save it somewhere safe!)

   **Boot volume**: Leave default (50 GB is fine)

5. Click **"Create"**
6. Wait ~2 minutes for it to start
7. Copy the **Public IP address** shown on the instance details page

### 2.3 Connect to Your Server

**On Mac/Linux:**
```bash
# If you downloaded Oracle's key
chmod 600 ~/Downloads/ssh-key-*.key
ssh -i ~/Downloads/ssh-key-*.key ubuntu@YOUR_IP_ADDRESS

# If you used your own key
ssh ubuntu@YOUR_IP_ADDRESS
```

**On Windows:**
- Download [PuTTY](https://www.putty.org/)
- Use PuTTYgen to convert the .key file to .ppk
- Connect using the IP address and your key

### 2.4 Open Firewall Ports

Your server needs ports 80 (HTTP) and 443 (HTTPS) open.

**In Oracle Cloud Console:**
1. Go to your instance → **"Attached VNICs"** → click the VNIC name
2. Click **"Subnet"** → click your subnet name
3. Click **"Security Lists"** → click the default security list
4. Click **"Add Ingress Rules"** and add:

   **Rule 1 (HTTP):**
   - Source CIDR: `0.0.0.0/0`
   - Destination Port Range: `80`

   **Rule 2 (HTTPS):**
   - Source CIDR: `0.0.0.0/0`
   - Destination Port Range: `443`

**On the server itself:**
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

### 2.5 Install Docker

Run these commands on your Oracle server:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Add yourself to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
exit
```

Log back in:
```bash
ssh ubuntu@YOUR_IP_ADDRESS
```

Verify Docker works:
```bash
docker --version
docker compose version
```

---

## Step 3: Domain Setup

### 3.1 Transfer DNS to Cloudflare (Recommended)

If your domain (`breeze.engineer`) isn't already on Cloudflare:

1. Log into Cloudflare → **Add a site** → enter `breeze.engineer`
2. Select **Free plan**
3. Cloudflare will scan your DNS records
4. Go to your domain registrar and change nameservers to Cloudflare's (they'll show you which ones)
5. Wait for DNS propagation (can take up to 24 hours)

### 3.2 Add DNS Records

In Cloudflare DNS settings, add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | YOUR_ORACLE_IP | Off (grey cloud) |
| A | www | YOUR_ORACLE_IP | Off (grey cloud) |
| A | docs | YOUR_ORACLE_IP | Off (grey cloud) |

**Important**: Keep proxy OFF (grey cloud) for now. You can enable it later after SSL is working.

---

## Step 4: GitHub App

### 4.1 Create the GitHub App

1. Go to https://github.com/settings/apps
2. Click **"New GitHub App"**
3. Fill in:

   **Basic info:**
   - **GitHub App name**: `Terragon-breeze` (must be unique)
   - **Homepage URL**: `https://breeze.engineer`

   **Identifying and authorizing users:**
   - **Callback URL**: `https://breeze.engineer/api/auth/callback/github`
   - Check: ✅ "Request user authorization (OAuth) during installation"

   **Post installation:**
   - **Setup URL** (optional): `https://breeze.engineer/setup`

   **Webhook:**
   - Check: ✅ "Active"
   - **Webhook URL**: `https://breeze.engineer/api/webhooks/github`
   - **Webhook secret**: Generate one with this command on your server:
     ```bash
     openssl rand -hex 32
     ```
     Copy this value - you'll need it for `GITHUB_WEBHOOK_SECRET`

   **Permissions:**

   Under **Repository permissions**:
   - Contents: **Read & write**
   - Metadata: **Read-only** (auto-selected)
   - Pull requests: **Read & write**
   - Checks: **Read-only**

   Under **Account permissions**:
   - Email addresses: **Read-only**

   **Subscribe to events:**
   - ✅ Pull request
   - ✅ Check run
   - ✅ Check suite

   **Where can this GitHub App be installed?**
   - Select: **Any account**

4. Click **"Create GitHub App"**

### 4.2 Get Your GitHub App Credentials

After creating, you'll be on the app settings page:

1. **App ID**: Shown at the top (number like `123456`) → Save as `GITHUB_APP_ID`
2. **Client ID**: In "About" section (starts with `Iv1.`) → Save as `GITHUB_CLIENT_ID`
3. Click **"Generate a new client secret"** → Save as `GITHUB_CLIENT_SECRET`
4. Scroll down to **"Private keys"** → Click **"Generate a private key"**
   - A `.pem` file will download
   - Open it in a text editor
   - You need to convert it to a single line with `\n` for newlines
   - Save as `GITHUB_APP_PRIVATE_KEY`

**Converting the private key:**
```bash
# On Mac/Linux, run this to convert the .pem to a single line:
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ~/Downloads/your-app-name.*.private-key.pem
```

Copy the output - that's your `GITHUB_APP_PRIVATE_KEY` value.

5. Note the **App slug** (the URL-friendly name) → Save as `NEXT_PUBLIC_GITHUB_APP_NAME`
   - For example, if your app URL is `https://github.com/apps/terragon-breeze`, the slug is `terragon-breeze`

---

## Step 5: API Keys

### 5.1 Anthropic (Required)

1. Go to https://console.anthropic.com
2. Sign in / create account
3. Go to **API Keys** → **Create Key**
4. Copy the key → Save as `ANTHROPIC_API_KEY`

### 5.2 E2B (Required)

1. Go to https://e2b.dev
2. Sign in / create account
3. Go to Dashboard → **API Keys** → **Create**
4. Copy the key → Save as `E2B_API_KEY`

### 5.3 OpenAI (Optional but recommended)

1. Go to https://platform.openai.com
2. Sign in / create account
3. Go to **API Keys** → **Create new secret key**
4. Copy the key → Save as `OPENAI_API_KEY`

### 5.4 Generate Secret Keys

Run these commands to generate random secrets:

```bash
# Run these on your Oracle server (or any terminal)
echo "BETTER_AUTH_SECRET=$(openssl rand -hex 32)"
echo "ENCRYPTION_MASTER_KEY=$(openssl rand -hex 32)"
echo "INTERNAL_SHARED_SECRET=$(openssl rand -hex 32)"
echo "CRON_SECRET=$(openssl rand -hex 32)"
```

Save all these values.

---

## Step 6: Cloudflare R2

R2 is Cloudflare's file storage - it's free up to 10GB.

### 6.1 Enable R2

1. Log into Cloudflare
2. Go to **R2 Object Storage** in the sidebar
3. If prompted, add a payment method (you won't be charged for free tier usage)

### 6.2 Create Buckets

Create two buckets:

1. Click **"Create bucket"**
   - Name: `terragon-public`
   - Location: Choose closest to your server
   - Click **Create**

2. Click **"Create bucket"** again
   - Name: `terragon-private`
   - Location: Same as above
   - Click **Create**

### 6.3 Set Up Public Access for Public Bucket

1. Click on `terragon-public` bucket
2. Go to **Settings** tab
3. Under **Public access**, click **"Allow access"**
4. Copy the public URL (like `https://pub-abc123.r2.dev`) → Save as `R2_PUBLIC_URL`

### 6.4 Create API Token

1. Go back to R2 main page
2. Click **"Manage R2 API Tokens"** (top right)
3. Click **"Create API token"**
4. Configure:
   - **Token name**: `terragon`
   - **Permissions**: **Object Read & Write**
   - **Specify bucket(s)**: Add both `terragon-public` and `terragon-private`
   - **TTL**: No expiration (or set one if you prefer)
5. Click **"Create API Token"**
6. Save:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`

### 6.5 Get Account ID

1. Go to Cloudflare dashboard home
2. Your **Account ID** is in the right sidebar (or URL)
3. Save as `R2_ACCOUNT_ID`

---

## Step 7: PartyKit

PartyKit hosts the WebSocket service for real-time features.

### 7.1 Install PartyKit CLI

On your local computer (not the Oracle server):

```bash
npm install -g partykit
```

### 7.2 Login

```bash
npx partykit login
```

This opens a browser to authenticate.

### 7.3 Clone and Deploy

```bash
# Clone the repo locally (if you haven't)
git clone https://github.com/YOUR_USERNAME/terragon.git
cd terragon/apps/broadcast

# Create .env file
cat > .env << EOF
BETTER_AUTH_URL=https://breeze.engineer
INTERNAL_SHARED_SECRET=YOUR_INTERNAL_SHARED_SECRET_FROM_STEP_5
E2B_API_KEY=YOUR_E2B_API_KEY
EOF

# Deploy
npx partykit deploy
```

### 7.4 Note Your PartyKit URL

After deployment, PartyKit shows your URL (something like `broadcast.your-username.partykit.dev`).

Save:
- `NEXT_PUBLIC_BROADCAST_HOST=broadcast.your-username.partykit.dev`
- `NEXT_PUBLIC_BROADCAST_URL=wss://broadcast.your-username.partykit.dev`

---

## Step 8: Deploy App

### 8.1 Clone Repository on Server

SSH into your Oracle server:

```bash
ssh ubuntu@YOUR_IP_ADDRESS
```

Clone your repo:

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/terragon.git
cd terragon
```

### 8.2 Create Environment File

```bash
cp .env.production.example .env.production
nano .env.production
```

Fill in ALL the values you collected:

```env
# === DATABASE ===
# This is auto-configured by docker-compose, leave as-is
DATABASE_URL=postgresql://terragon:changeme@postgres:5432/terragon

# === REDIS ===
# This is auto-configured by docker-compose, leave as-is for local Redis
# (You can also use Upstash if you prefer external Redis)
REDIS_URL=http://redis:6379
REDIS_TOKEN=

# === AUTH ===
BETTER_AUTH_URL=https://breeze.engineer
BETTER_AUTH_SECRET=your_generated_secret_from_step_5
ENCRYPTION_MASTER_KEY=your_generated_secret_from_step_5
INTERNAL_SHARED_SECRET=your_generated_secret_from_step_5
CRON_SECRET=your_generated_secret_from_step_5

# === PUBLIC URLs ===
NEXT_PUBLIC_APP_URL=https://breeze.engineer
NEXT_PUBLIC_BROADCAST_HOST=broadcast.your-username.partykit.dev
NEXT_PUBLIC_BROADCAST_URL=wss://broadcast.your-username.partykit.dev
NEXT_PUBLIC_DOCS_URL=https://docs.breeze.engineer
NEXT_PUBLIC_GITHUB_APP_NAME=terragon-breeze

# === AI PROVIDERS ===
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
E2B_API_KEY=e2b_xxxxx

# === FILE STORAGE (Cloudflare R2) ===
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_ACCOUNT_ID=xxxxx
R2_BUCKET_NAME=terragon-public
R2_PRIVATE_BUCKET_NAME=terragon-private
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# === GITHUB APP ===
GITHUB_CLIENT_ID=Iv1.xxxxx
GITHUB_CLIENT_SECRET=xxxxx
GITHUB_WEBHOOK_SECRET=xxxxx
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"

# === OPTIONAL ===
# RESEND_API_KEY=re_xxxxx
# OPENROUTER_API_KEY=sk-or-xxxxx
```

Save with `Ctrl+O`, `Enter`, then exit with `Ctrl+X`.

### 8.3 Set Postgres Password

```bash
# Create a password for the database
export POSTGRES_PASSWORD=$(openssl rand -hex 16)
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" >> .env.production
echo "Your postgres password is: $POSTGRES_PASSWORD"
```

### 8.4 Build and Start

```bash
# Build the Docker image (this takes 5-10 minutes the first time)
docker compose build

# Start everything
docker compose up -d

# Check if it's running
docker compose ps

# View logs
docker compose logs -f app
```

Press `Ctrl+C` to exit logs.

---

## Step 9: Nginx & SSL

### 9.1 Install Nginx and Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 9.2 Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/terragon
```

Paste this:

```nginx
server {
    listen 80;
    server_name breeze.engineer www.breeze.engineer;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}

server {
    listen 80;
    server_name docs.breeze.engineer;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save and exit.

### 9.3 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/terragon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9.4 Get SSL Certificates

```bash
sudo certbot --nginx -d breeze.engineer -d www.breeze.engineer -d docs.breeze.engineer
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to share email with EFF
- Choose "redirect HTTP to HTTPS" when asked

Certbot auto-renews certificates.

---

## Step 10: Database Schema

Push the database schema:

```bash
cd ~/terragon

# Run the schema migration
docker compose exec app node -e "
const { execSync } = require('child_process');
process.chdir('/app');
execSync('npx drizzle-kit push', {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
});
"
```

**Alternative method** (if the above doesn't work):

```bash
# Enter the app container
docker compose exec app sh

# Inside container, run:
cd /app && npx drizzle-kit push

# Exit container
exit
```

---

## Staying Free

### Oracle Cloud Free Tier Rules

**What's Always Free:**
- 4 Ampere A1 OCPUs and 24 GB memory total (you can split across instances)
- 200 GB block storage total
- 10 TB outbound data per month
- 2 AMD micro instances (1 OCPU, 1 GB each)

**What Costs Money (AVOID THESE):**
- ❌ Load Balancers (~$10-20/month)
- ❌ NAT Gateways (~$5/month)
- ❌ More than 200 GB storage
- ❌ Upgrading to "Pay As You Go" account type
- ❌ Creating non-free-tier shapes (check for "Always Free-eligible" badge)

### Set Up Billing Alert

1. In Oracle Cloud Console, go to **Billing & Cost Management** → **Budgets**
2. Click **Create Budget**
3. Configure:
   - Name: `Free Tier Alert`
   - Target Type: Tenancy
   - Amount: `$0`
   - Alert threshold: 100%
   - Enter your email
4. Click **Create**

Now you'll get an email if anything tries to charge you.

### Other Free Services

| Service | Free Tier Limits |
|---------|-----------------|
| Cloudflare R2 | 10 GB storage, 1M requests/month |
| PartyKit | 1,000 messages/day, unlimited connections |
| E2B | 60 hours/month compute |
| Resend | 100 emails/day |

---

## Troubleshooting

### App won't start

```bash
# Check logs
docker compose logs app

# Check if containers are running
docker compose ps

# Restart everything
docker compose down && docker compose up -d
```

### Database connection errors

```bash
# Check if postgres is running
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U terragon -c "SELECT 1"
```

### Can't connect to server

1. Check Oracle security list rules (Step 2.4)
2. Check iptables rules on server
3. Make sure nginx is running: `sudo systemctl status nginx`

### SSL certificate issues

```bash
# Test nginx config
sudo nginx -t

# Renew certificates
sudo certbot renew --dry-run
```

### GitHub App not working

1. Verify callback URL matches exactly: `https://breeze.engineer/api/auth/callback/github`
2. Check webhook URL: `https://breeze.engineer/api/webhooks/github`
3. Verify all credentials in `.env.production`

### PartyKit connection errors

1. Check `NEXT_PUBLIC_BROADCAST_URL` uses `wss://` (not `https://`)
2. Verify `INTERNAL_SHARED_SECRET` matches in both PartyKit `.env` and app `.env.production`

---

## Updating the App

To deploy updates:

```bash
cd ~/terragon

# Pull latest code
git pull

# Rebuild and restart
docker compose build
docker compose up -d

# Check logs
docker compose logs -f app
```

---

## Summary

You now have:
- ✅ Free Oracle Cloud VM running your app
- ✅ PostgreSQL database
- ✅ Redis for caching
- ✅ Nginx reverse proxy with SSL
- ✅ PartyKit WebSocket service
- ✅ Cloudflare R2 file storage
- ✅ GitHub App for authentication

Your app is live at: **https://breeze.engineer**

Total recurring cost: **$0/month** (plus AI API usage)
