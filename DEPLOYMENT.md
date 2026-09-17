# Hostinger setup for F&G

Target: **https://jobs.fandg-llc.com**. Start empty; no Base44 records need importing. **Jobsite Notebook** is a working name and can be changed before buying a separate domain.

The code is prepared locally. No Hostinger resources have been created or changed, and no live account has been created.

1. In Hostinger, create a dedicated MySQL database and user for this app. Keep credentials in Hostinger's environment settings, not in chat or git. Confirm database storage limits and a maximum packet size of at least 8 MB.
2. Use an available Business plan web app slot. Upload the source ZIP or connect a private Git repository. Select a backend app (Express/Other), Node.js 24, build command `npm run build`, entry file `server/index.js`, and application root at the repository root. If asked for a start command, use `npm start`. Install with `npm ci`. `dist` contains the frontend output; the server and dependencies must also be deployed.
3. Configure `NODE_ENV=production`, `APP_ORIGIN=https://jobs.fandg-llc.com`, `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. Set `DB_PORT` if needed. Use Hostinger's assigned `PORT`. See `.env.example` for optional email recovery and photo quota settings.
4. Assign `jobs.fandg-llc.com` to this new app and enable HTTPS. Leave the existing business websites in place.
5. From a trusted shell connected to the app's database, run `npm run account -- invite YOUR_EMAIL`. Open the private invitation link and choose your password. The first account is created only when you accept this invitation. See README.md for the remote-MySQL alternative if the web app has no shell.
6. Check `/api/health`, log in, create a client and job, upload a photo, download a backup, restart/redeploy, and confirm the data and photo persist. Check a second invited account cannot see the first account's data, including direct photo URLs.
7. Confirm Hostinger backups include the app's MySQL database and test restoration into a separate database. Keep a downloaded account backup outside Hostinger too.

Local integration tests run against SQLite. Hostinger MySQL, SMTP delivery, HTTPS cookies, photo persistence after redeployment, and browser/mobile behavior must be verified on the hosted app before relying on it for live work. SMTP is optional; without it, the account reset CLI supplies password-reset links. Google sign-in is not configured. Dictation depends on browser support, with phone keyboard dictation as the fallback.
