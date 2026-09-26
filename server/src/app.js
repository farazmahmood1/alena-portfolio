import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { contactSchema, fieldErrors } from './contact.schema.js';

// Builds the API. Dependencies are passed in so tests can swap the database and mailer.
export function createApp({ config, Lead, mailer, logger = console }) {
	const app = express();
	app.disable('x-powered-by');
	app.set('trust proxy', config.trustProxy);
	app.use(helmet());
	app.use(
		cors({
			origin: (origin, cb) => cb(null, !origin || config.corsOrigins.includes(origin)),
			methods: ['POST', 'GET', 'OPTIONS']
		})
	);
	app.use(express.json({ limit: '20kb' }));

	app.get('/api/health', (req, res) => res.json({ ok: true }));

	const contactLimiter = rateLimit({
		windowMs: 15 * 60 * 1000,
		limit: 5,
		standardHeaders: 'draft-7',
		legacyHeaders: false,
		handler: (req, res) => res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' })
	});

	app.post('/api/contact', contactLimiter, async (req, res, next) => {
		try {
			const parsed = contactSchema.safeParse(req.body || {});
			if (!parsed.success) return res.status(400).json({ ok: false, errors: fieldErrors(parsed.error) });

			const { hp, ...data } = parsed.data;
			// Honeypot filled in: answer like a success so the bot learns nothing, but keep nothing.
			if (hp) return res.status(201).json({ ok: true });

			// Save first — a failed email must never lose the lead.
			const lead = await Lead.create({ ...data, notification: { status: mailer.enabled ? 'pending' : 'disabled' } });

			if (mailer.enabled) {
				try {
					await mailer.send(lead);
					await Lead.updateOne({ _id: lead._id }, { $set: { 'notification.status': 'sent' } });
				} catch (err) {
					logger.error('Lead notification email failed', { leadId: String(lead._id), error: err.message });
					await Lead.updateOne({ _id: lead._id }, { $set: { 'notification.status': 'failed', 'notification.error': String(err.message).slice(0, 500) } });
				}
			}
			return res.status(201).json({ ok: true });
		} catch (err) {
			return next(err);
		}
	});

	app.use('/api', (req, res) => res.status(404).json({ ok: false, error: 'Not found' }));

	// Never leak stack traces or internals to the client.
	// eslint-disable-next-line no-unused-vars
	app.use((err, req, res, next) => {
		if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
			return res.status(400).json({ ok: false, error: 'Invalid request' });
		}
		logger.error('Unhandled API error', { error: err.message });
		return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' });
	});

	return app;
}
