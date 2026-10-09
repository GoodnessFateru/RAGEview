# RAGEview setup

Do the basics once (steps 1 to 4), then add each platform you want (step 5).

1. Upload this whole folder to a GitHub repository (keep the `api` folder as it is).
2. In Vercel: Add New > Project > import the repository > Deploy.
3. In the Vercel project, open Storage and add a Neon Postgres database (it sets DATABASE_URL for you). In its SQL editor, run everything in schema.sql.
4. In Vercel > Settings > Environment Variables add: APP_PASSWORD (the password you will type to enter RAGEview), SESSION_SECRET and CRON_SECRET (two different long random texts), and BASE_URL (https://YOUR-SITE.vercel.app). Redeploy.
5. For each platform below, create a developer app and use this same redirect URL in every one: https://YOUR-SITE.vercel.app/api/callback
   Then add its variables in Vercel and redeploy.

| Platform | Where to create the app | Variables | What to expect |
|---|---|---|---|
| YouTube | console.cloud.google.com: enable "YouTube Data API v3", create an OAuth client (Web). Set the consent screen to "In production" so links do not expire after 7 days. | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET | Works quickly. YouTube gives views, shown as impressions. |
| Facebook and Instagram | developers.facebook.com: create a Business app, add Facebook Login. Permissions: pages_show_list, pages_read_engagement, read_insights, instagram_basic, instagram_manage_insights. Instagram must be a Business or Creator account linked to a Facebook Page. | META_APP_ID, META_APP_SECRET | Works at once for people who have a role on your app. Anyone else needs Meta App Review. Meta now reports "media views" instead of impressions. |
| LinkedIn | linkedin.com/developers: create an app linked to your company Page and request the Community Management API. | LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_VERSION (optional, a recent version like 202606) | Needs LinkedIn's approval, which can take days or weeks. Company Pages only, not personal profiles. |
| X | developer.x.com: create a project and app with OAuth 2.0 (confidential client) and add credits for pay-per-use. | X_CLIENT_ID, X_CLIENT_SECRET | X charges per post read, roughly $2 per brand per month at daily refresh. |
| TikTok | developers.tiktok.com: create an app, add Login Kit and the Display API with scopes user.info.basic and video.list. | TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET | TikTok must approve the app before other people's accounts work. |

6. Open your site, enter the password, go to Brands & accounts, press Connect on a platform, press Allow, then press "Refresh numbers now". After that, numbers update by themselves every day.

If an account shows "Needs reconnecting", press Reconnect next to it. If "Refresh numbers now" shows an error message, that message says which platform and why.
