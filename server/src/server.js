import 'dotenv/config';
import mongoose from 'mongoose';
import { loadConfig } from './config.js';
import { createApp } from './app.js';
import { createMailer } from './mailer.js';
import { Lead } from './lead.model.js';

const config = loadConfig();
if (!config.mongoUri) {
	console.error('MONGODB_URI is not set — see .env.example');
	process.exit(1);
}

await mongoose.connect(config.mongoUri);
const mailer = createMailer(config);
if (!mailer.enabled) console.warn('SMTP or CONTACT_NOTIFY_EMAIL not set — leads will be stored without email notifications');

const app = createApp({ config, Lead, mailer });
const server = app.listen(config.port, () => console.log(`Codilated API listening on :${config.port}`));

const shutdown = () => server.close(() => mongoose.disconnect().then(() => process.exit(0)));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
