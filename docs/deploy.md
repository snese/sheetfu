# Deployment Guide

## Deploy to Cloudflare Pages

### Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Repository pushed to GitHub
- Environment variables ready (see [setup.md](setup.md))

### Steps

1. Log in to Cloudflare Dashboard
2. Go to **Workers & Pages** → **Create application** → **Pages**
3. Connect to Git → Select your SheetFu fork
4. Build settings:
   - Framework preset: **Next.js**
   - Build command: `npm run build`
   - Build output directory: `.next`
5. Environment variables — add:
   - `SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `ALLOWED_EMAILS` (comma-separated family emails)
6. Click **Save and Deploy**

### Custom Domain (Optional)

1. In Cloudflare Pages → your project → Custom domains
2. Add your domain
3. Follow DNS instructions

## Authentication with Cloudflare Access

To restrict access to family members only:

1. Go to Cloudflare Dashboard → **Zero Trust** → **Access** → **Applications**
2. Add an application → Self-hosted
3. Application domain: your SheetFu domain
4. Add a policy:
   - Name: Family
   - Action: Allow
   - Include: Emails — add family member emails
5. Save

Cloudflare Access sends `cf-access-authenticated-user-email` header on every request. SheetFu middleware validates this header for API routes.

## Verify Deployment

1. Visit your deployed URL
2. Authenticate via Cloudflare Access
3. Confirm dashboard loads with your Sheet data
