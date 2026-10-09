# RAGEview setup (about 30 minutes, one time)

1. Upload this whole folder to a GitHub repository (keep the `api` folder as it is).
2. In Vercel: Add New > Project > import the repository > Deploy.
3. In your Vercel project open Storage > add a Neon Postgres database (this sets DATABASE_URL by itself). Open its SQL editor and run everything in schema.sql.
4. Google setup (console.cloud.google.com):
   - Create a project and enable "YouTube Data API v3".
   - OAuth consent screen: External. Add your Google account as a test user. To stop links expiring after 7 days, set the publishing status to "In production" (Google shows an "unverified app" warning, which is fine for your own use).
   - Credentials > Create OAuth client ID > Web application. Authorized redirect URI: https://YOUR-SITE.vercel.app/api/callback
5. In Vercel > Settings > Environment Variables add:
   APP_PASSWORD (the password you will type to enter RAGEview), SESSION_SECRET (any long random text), CRON_SECRET (another long random text), GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL (https://YOUR-SITE.vercel.app). Then redeploy.
6. Open your site, enter the password, go to Brands & accounts, press Connect YouTube, press Allow, then press "Refresh numbers now". After that, numbers update by themselves every day.
