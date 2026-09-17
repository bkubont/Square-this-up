import { z } from 'zod';
import { randomUUID } from 'node:crypto';

const text = z.string().max(20000);
const id = z.string().min(1).max(36);
const money = z.number().finite().min(0).max(1e12);
const date = z.string().refine(v => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v))), 'Invalid date');
export const schemas = {
  Client: z.object({ name: z.string().trim().min(1).max(250), address: text.optional(), phone: text.optional(), email: text.optional(), notes: text.optional() }),
  Job: z.object({ title: z.string().trim().min(1).max(250), client_id: id, client_name: text.optional(), description: text.optional(),
    status: z.enum(['Estimate','Scheduled','In Progress','Waiting on Materials','Completed','Paid']).default('Estimate'),
    start_date: date.optional(), end_date: date.optional(), estimate_amount: money.optional(), invoice_amount: money.optional(),
    deposit_amount: money.optional(), materials_cost: money.optional(), notes: text.optional(),
    checklist: z.array(z.object({ text, done: z.boolean() })).max(1000).optional() }),
  TimelineEntry: z.object({ job_id: id, type: z.enum(['note','photo','receipt','document','estimate_sent','deposit_received','invoice_sent','payment_received','status_change','checklist']),
    text: text.optional(), photo_url: z.string().max(200).optional(),
    category: z.enum(['before','after','work','receipt','document','note','financial']).default('note'), amount: money.optional() }),
};
export const fail = (status, message) => Object.assign(new Error(message), { status });
export const decode = row => ({ ...JSON.parse(row.data), id: row.id, created_date: row.created_date, updated_date: row.updated_date });
export async function getRecord(db, owner, entity, recordId) {
  const [row] = await db.all('SELECT * FROM records WHERE owner_id = ? AND entity = ? AND id = ?', [owner, entity, recordId]);
  if (!row) throw fail(404, 'Record not found');
  return decode(row);
}
export async function saveRecord(db, owner, entity, input, recordId) {
  if (!schemas[entity]) throw fail(404, 'Unknown record type');
  const previous = recordId ? await getRecord(db, owner, entity, recordId) : {};
  const data = schemas[entity].parse({ ...previous, ...input });
  const parent = entity === 'Job' ? data.client_id : entity === 'TimelineEntry' ? data.job_id : null;
  if (parent) await getRecord(db, owner, entity === 'Job' ? 'Client' : 'Job', parent);
  if (data.photo_url) {
    const match = /^\/api\/files\/([a-f0-9-]{36})$/.exec(data.photo_url);
    if (!match || !(await db.all('SELECT id FROM files WHERE id = ? AND owner_id = ?', [match[1], owner])).length)
      throw fail(400, 'Choose a file uploaded to your account');
  }
  const now = new Date().toISOString();
  const key = recordId || randomUUID();
  if (recordId) await db.run('UPDATE records SET data = ?, parent_id = ?, updated_date = ? WHERE id = ? AND owner_id = ?', [JSON.stringify(data), parent, now, key, owner]);
  else await db.run('INSERT INTO records (id, owner_id, entity, parent_id, data, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, ?)', [key, owner, entity, parent, JSON.stringify(data), now, now]);
  return { ...data, id: key, created_date: previous.created_date || now, updated_date: now };
}
