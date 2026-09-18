import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
for (const [name, args] of [
  ['Hostinger-style require', ['--eval', "require('./server/index.js')"]],
  ['direct Node entry', ['server/index.js']],
]) {
  test(`server starts through ${name}`, { timeout: 15000 }, async t => {
    const env = { ...process.env, NODE_ENV: 'development', SQLITE_PATH: ':memory:', PORT: '0', APP_ORIGIN: 'http://localhost:5173' };
    for (const key of Object.keys(env)) if (key.startsWith('DB_')) delete env[key];
    const child = spawn(process.execPath, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    t.after(() => { child.kill(); });
    const port = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error(`Startup timed out: ${output}`)), 10000);
      const fail = error => { clearTimeout(timer); reject(error); };
      child.on('error', fail);
      child.once('exit', code => fail(new Error(`Server exited (${code}): ${output}`)));
      child.stderr.on('data', chunk => { output += chunk; });
      child.stdout.on('data', chunk => {
        output += chunk;
        const match = /server is ready on port (\d+)/.exec(output);
        if (match) { clearTimeout(timer); resolve(Number(match[1])); }
      });
    });
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });
}
