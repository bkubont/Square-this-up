import 'dotenv/config';
import { openDatabase, migrate } from './db.js';
import { createApp } from './app.js';
const db = await openDatabase();
await migrate(db);
const app = await createApp(db);
const server = app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Jobsite Notebook server is ready'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await db.close(); process.exit(0); }));
