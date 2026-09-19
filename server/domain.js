import { z } from 'zod';
import { randomUUID } from 'node:crypto';

const text = z.string().max(20000);
const id = z.string().min(1).max(36);
const money = z.number().finite().min(0).max(1e12);
const optionalText = z.preprocess(value => (value === '' || value == null ? undefined : value), text.optional());
const changeOrder = z.object({ id, reason: text, description: text.optional(), labor_amount: money.optional(), materials_amount: money.optional(), status: z.enum(['draft', 'sent', 'approved', 'declined']).default('draft'), photo_urls: z.array(z.string().max(200)).max(50).default([]) });
const date = z.string().refine(v => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v))), 'Invalid date');
const lineItem = z.object({
  id,
  name: optionalText,
  description: optionalText,
  quantity: money.optional(),
  price: money.optional(),
});
export const documentTypes = /** @type {const} */ (['estimate', 'work_order', 'change_order', 'material_order', 'invoice']);
export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(250),
  business_name: optionalText,
  logo_url: optionalText,
  labor_rate: money.optional(),
  address: optionalText,
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  zip: z.string().trim().min(1, 'ZIP is required').max(20),
  phone: z.string().trim().min(1, 'Phone number is required').max(50),
  email: z.preprocess(value => (value === '' || value == null ? undefined : value), z.string().trim().email().max(254).optional()),
  website: optionalText,
});
export const schemas = {
  Client: z.object({ name: z.string().trim().min(1).max(250), address: text.optional(), address_line2: text.optional(), phone: text.optional(), email: text.optional(), notes: text.optional() }),
  Job: z.object({ title: z.string().trim().min(1).max(250), client_id: id, client_name: text.optional(), description: text.optional(),
    status: z.enum(['Estimate','Accepted','Scheduled','In Progress','Waiting on Materials','Completed','Paid']).default('Estimate'),
    start_date: date.optional(), end_date: date.optional(), estimate_amount: money.optional(), invoice_amount: money.optional(),
    deposit_amount: money.optional(), materials_cost: money.optional(), estimate_description: text.optional(), estimate_labor_amount: money.optional(), estimate_materials_amount: money.optional(), invoice_finalized: z.boolean().optional(), change_orders: z.array(changeOrder).max(200).optional(), notes: text.optional(),
    checklist: z.array(z.object({ text, done: z.boolean() })).max(1000).optional() }),
  Document: z.object({
    type: z.enum(documentTypes),
    job_id: id,
    client_id: id.optional(),
    client_name: optionalText,
    title: z.string().trim().min(1).max(250),
    number: z.string().trim().min(1).max(20),
    date: date,
    due_date: date.optional(),
    line_items: z.array(lineItem).min(1).max(500),
    discount_label: optionalText,
    discount_amount: money.optional(),
    notes: optionalText,
  }),
  TimelineEntry: z.object({ job_id: id, type: z.enum(['note','photo','receipt','document','estimate_sent','deposit_received','invoice_sent','payment_received','status_change','checklist','change_sent','change_approved','invoice_finalized']),
    text: text.optional(), photo_url: z.string().max(200).optional(),
    category: z.enum(['before','after','work','receipt','document','note','financial','change']).default('note'), amount: money.optional() }),
};
export const fail = (status, message) => Object.assign(new Error(message), { status });
export const decode = row => ({ ...JSON.parse(row.data), id: row.id, created_date: row.created_date, updated_date: row.updated_date });
export function parseProfile(value) {
  if (!value) return null;
  try {
    const parsed = typeof value === "object" ? value : JSON.parse(value);
    return profileSchema.parse(parsed);
  } catch { return null; }
}
export function publicUser(user) {
  return { id: user.id, email: user.email, created_date: user.created_date, profile: parseProfile(user.profile) };
}
export function profileIsComplete(profile) {
  return Boolean(profile?.name && profile?.city && profile?.state && profile?.zip && profile?.phone);
}
async function ownedFile(db, owner, url) {
  const match = /^\/api\/files\/([a-f0-9-]{36})$/.exec(url);
  if (!match || !(await db.all('SELECT id FROM files WHERE id = ? AND owner_id = ?', [match[1], owner])).length)
    throw fail(400, 'Choose a file uploaded to your account');
}
export async function getRecord(db, owner, entity, recordId) {
  const [row] = await db.all('SELECT * FROM records WHERE owner_id = ? AND entity = ? AND id = ?', [owner, entity, recordId]);
  if (!row) throw fail(404, 'Record not found');
  return decode(row);
}
export async function saveRecord(db, owner, entity, input, recordId) {
  if (!schemas[entity]) throw fail(404, 'Unknown record type');
  const previous = recordId ? await getRecord(db, owner, entity, recordId) : {};
  let payload = { ...previous, ...input };
  if (entity === 'Document') {
    const job = await getRecord(db, owner, 'Job', payload.job_id);
    payload = { ...payload, client_id: job.client_id, client_name: job.client_name };
  }
  const data = schemas[entity].parse(payload);
  const parent = entity === 'Job' ? data.client_id : entity === 'TimelineEntry' || entity === 'Document' ? data.job_id : null;
  if (parent) await getRecord(db, owner, entity === 'Job' ? 'Client' : 'Job', parent);
  if (data.photo_url) await ownedFile(db, owner, data.photo_url);
  for (const photoUrl of (data.change_orders || []).flatMap(item => item.photo_urls || [])) await ownedFile(db, owner, photoUrl);
  const now = new Date().toISOString();
  const key = recordId || randomUUID();
  if (recordId) await db.run('UPDATE records SET data = ?, parent_id = ?, updated_date = ? WHERE id = ? AND owner_id = ?', [JSON.stringify(data), parent, now, key, owner]);
  else await db.run('INSERT INTO records (id, owner_id, entity, parent_id, data, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, ?)', [key, owner, entity, parent, JSON.stringify(data), now, now]);
  return { ...data, id: key, created_date: previous.created_date || now, updated_date: now };
}
export async function saveProfile(db, owner, input) {
  const profile = profileSchema.parse(input);
  if (profile.logo_url) await ownedFile(db, owner, profile.logo_url);
  await db.run('UPDATE users SET profile = ? WHERE id = ?', [JSON.stringify(profile), owner]);
  return profile;
}
