// End to end against a real (in-memory) MongoDB: POST /api/contact → a Lead document exists.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { Lead } from '../src/lead.model.js';

let mongo;
let server;
let base;
const sent = [];

before(async () => {
	mongo = await MongoMemoryServer.create();
	await mongoose.connect(mongo.getUri());
	const app = createApp({
		config: loadConfig({ TRUST_PROXY: '0' }),
		Lead,
		mailer: { enabled: true, async send(lead) { sent.push(lead); } },
		logger: { error() {} }
	});
	server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
	base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
	server?.close();
	await mongoose.disconnect();
	await mongo?.stop();
});

test('a submission is saved as a Lead with status "new" and the email is marked sent', async () => {
	const res = await fetch(`${base}/api/contact`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			fullName: 'Aisha Khan',
			email: 'Aisha@Example.com',
			phone: '+971 50 000 0000',
			projectType: 'E-commerce (Shopify / WooCommerce)',
			callPreference: 'Phone',
			message: 'Launching a skincare brand in Dubai.',
			privacyAccepted: true,
			sourcePage: 'https://codilated.com/contact',
			utm: { source: 'instagram', campaign: 'launch' }
		})
	});
	assert.equal(res.status, 201);
	const docs = await Lead.find().lean();
	assert.equal(docs.length, 1);
	const lead = docs[0];
	assert.equal(lead.email, 'aisha@example.com');
	assert.equal(lead.status, 'new');
	assert.equal(lead.notification.status, 'sent');
	assert.equal(lead.utm.campaign, 'launch');
	assert.ok(lead.createdAt instanceof Date);
	assert.equal(sent.length, 1);
});
