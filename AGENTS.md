# AGENTS.md

This is a user-owned standalone React/Vite + Express job tracker being migrated from Base44 to Hostinger Business hosting. Read README.md for setup, account management, data migration and deployment.

- Keep changes focused and preserve the existing UI conventions.
- Frontend: src/. API client: src/api/client.js. Backend: server/.
- Production requires MySQL; local development uses persistent SQLite.
- Every record, relationship and file operation must enforce the authenticated account's ownership server-side. Public registration remains invitation-only.
- Keep secrets, account exports, local databases and invitation links out of git.
- Run npm test, npm run lint, npm run typecheck and npm run build for relevant changes.
- Preserve base44/entities as source migration references. Do not reintroduce Base44 SDK or runtime dependencies.
- Use npm run dev locally and npm start for the built production app. Deployment details are in README.md.
