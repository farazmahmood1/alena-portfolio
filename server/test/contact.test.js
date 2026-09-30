import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { formatLeadEmail } from '../src/mailer.js';
import { Lead as LeadModel } from '../src/lead.model.js';

// In-memory stand-ins for the Mongoose model and the mailer.
function fakeLead() {
	const rows = [];
	return {
		rows,
		async create(doc) { const row = { _id: String(rows.length + 1), createdAt: new Date(), ...doc }; rows.push(row); return row; },
		async updateOne({ _id }, { $set }) {
			const row = rows.find((r) => r._id === _id);
			for (const [k, v] of Object.entries($set)) {
				const [a, b] = k.split('.');
				if (b) row[a] = { ...row[a], [b]: v }; else row[a] = v;
			}
		}
	};
}

const valid = {
	salutation: 'Ms.',
	fullName: 'Jordan Ellis',
	email: 'jordan@example.com',
	projectType: 'Website',
	timeline: 'As soon as possible',
	callPreference: 'Video-Call',
	message: 'We sell skincare and need a Shopify store.',
	privacyAccepted: true,
	sourcePage: 'https://codilated.com/contact',
	utm: { source: 'google', medium: 'cpc' },
	hp: ''
};

let servers = [];
async function start({ mailer, Lead = fakeLead(), env = {} } = {}) {
	const config = loadConfig({ CORS_ORIGIN: 'https://codilated.com', TRUST_PROXY: '0', ...env });
	const sent = [];
	const m = mailer || { enabled: true, async send(lead) { sent.push(lead); } };
	const quiet = { error() {} };
	const app = createApp({ config, Lead, mailer: m, logger: quiet });
	const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
	servers.push(server);
	const base = `http://127.0.0.1:${server.address().port}`;
	const post = (body, headers = {}) =>
		fetch(`${base}/api/contact`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
	return { base, post, Lead, sent };
}

beforeEach(() => {});
after(() => { for (const s of servers) s.close(); });

test('stores a valid lead, emails it, and answers 201', async () => {
	const { post, Lead, sent } = await start();
	const res = await post(valid);
	assert.equal(res.status, 201);
	assert.deepEqual(await res.json(), { ok: true });
	assert.equal(Lead.rows.length, 1);
	assert.equal(Lead.rows[0].fullName, 'Jordan Ellis');
	assert.equal(Lead.rows[0].utm.source, 'google');
	assert.equal(Lead.rows[0].notification.status, 'sent');
	assert.equal('hp' in Lead.rows[0], false);
	assert.equal(sent.length, 1);
});

test('a failed email still keeps the lead and still succeeds', async () => {
	const { post, Lead } = await start({ mailer: { enabled: true, async send() { throw new Error('SMTP down'); } } });
	const res = await post(valid);
	assert.equal(res.status, 201);
	assert.equal(Lead.rows.length, 1);
	assert.equal(Lead.rows[0].notification.status, 'failed');
	assert.match(Lead.rows[0].notification.error, /SMTP down/);
});

test('without SMTP the lead is stored with notifications disabled', async () => {
	const { post, Lead } = await start({ mailer: { enabled: false, async send() { throw new Error('should not send'); } } });
	assert.equal((await post(valid)).status, 201);
	assert.equal(Lead.rows[0].notification.status, 'disabled');
});

test('returns field errors for invalid input', async () => {
	const { post, Lead } = await start();
	const res = await post({ ...valid, fullName: '', email: 'not-an-email', privacyAccepted: false });
	assert.equal(res.status, 400);
	const body = await res.json();
	assert.equal(body.ok, false);
	assert.equal(body.errors.fullName, 'This field is required');
	assert.equal(body.errors.email, 'Please enter a valid email address');
	assert.equal(body.errors.privacyAccepted, 'Please accept the privacy policy');
	assert.equal(Lead.rows.length, 0);
});

test('phone is required only when a phone call is chosen', async () => {
	const { post } = await start();
	const res = await post({ ...valid, callPreference: 'Phone', phone: '' });
	assert.equal(res.status, 400);
	assert.equal((await res.json()).errors.phone, 'This field is required');
	assert.equal((await post({ ...valid, callPreference: 'Phone', phone: '+1 (805) 251-9188' })).status, 201);
});

test('honeypot submissions look successful but are not stored or emailed', async () => {
	const { post, Lead, sent } = await start();
	const res = await post({ ...valid, hp: 'http://spam.example' });
	assert.equal(res.status, 201);
	assert.equal(Lead.rows.length, 0);
	assert.equal(sent.length, 0);
});

test('rate limit: the 6th request within 15 minutes gets 429', async () => {
	const { post } = await start();
	for (let i = 0; i < 5; i++) assert.equal((await post(valid)).status, 201);
	const res = await post(valid);
	assert.equal(res.status, 429);
	assert.equal((await res.json()).ok, false);
});

test('malformed JSON and server errors never expose internals', async () => {
	const broken = { async create() { throw new Error('connection string mongodb://user:secret@host'); } };
	const { post } = await start({ Lead: broken });
	const bad = await post('{not json');
	assert.equal(bad.status, 400);
	assert.deepEqual(await bad.json(), { ok: false, error: 'Invalid request' });
	const res = await post(valid);
	assert.equal(res.status, 500);
	const text = await res.text();
	assert.doesNotMatch(text, /secret|stack|mongodb/i);
});

test('CORS allows the configured origin only', async () => {
	const { post } = await start();
	const ok = await post(valid, { origin: 'https://codilated.com' });
	assert.equal(ok.headers.get('access-control-allow-origin'), 'https://codilated.com');
	const other = await post(valid, { origin: 'https://evil.example' });
	assert.equal(other.headers.get('access-control-allow-origin'), null);
});

test('health endpoint and unknown API routes', async () => {
	const { base } = await start();
	assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { ok: true });
	assert.equal((await fetch(`${base}/api/nope`)).status, 404);
});

test('notification email lists every submitted field and escapes HTML', () => {
	const mail = formatLeadEmail({ ...valid, fullName: '<b>Jordan</b>', phone: '+1 555', createdAt: new Date('2026-09-26T10:00:00Z') });
	assert.match(mail.subject, /New enquiry: <b>Jordan<\/b> \| Website/);
	for (const v of ['jordan@example.com', '+1 555', 'Website', 'As soon as possible', 'Video-Call', 'skincare', 'source=google, medium=cpc', 'https://codilated.com/contact']) {
		assert.ok(mail.text.includes(v), `text includes ${v}`);
	}
	assert.ok(mail.html.includes('&lt;b&gt;Jordan&lt;/b&gt;'));
	assert.ok(!mail.html.includes('<b>Jordan</b>'));
});

test('Lead model enforces required fields and a default status', () => {
	const lead = new LeadModel({ fullName: 'A', email: 'A@EXAMPLE.COM', privacyAccepted: true });
	assert.equal(lead.validateSync(), undefined);
	assert.equal(lead.status, 'new');
	assert.equal(lead.email, 'a@example.com');
	const bad = new LeadModel({});
	const err = bad.validateSync();
	assert.ok(err.errors.fullName && err.errors.email && err.errors.privacyAccepted);
});
