// Runtime configuration, read once from the environment (see ../../.env.example).
export function loadConfig(env = process.env) {
	const list = (value) => (value || '').split(',').map((s) => s.trim()).filter(Boolean);
	return {
		port: Number(env.PORT) || 3001,
		mongoUri: env.MONGODB_URI || '',
		siteUrl: env.SITE_URL || 'https://codilated.com',
		corsOrigins: list(env.CORS_ORIGIN),
		// Number of reverse proxies in front of the app (so rate limiting sees the real client IP).
		trustProxy: env.TRUST_PROXY === undefined ? 1 : Number(env.TRUST_PROXY),
		smtp: {
			host: env.SMTP_HOST || '',
			port: Number(env.SMTP_PORT) || 587,
			user: env.SMTP_USER || '',
			pass: env.SMTP_PASS || '',
			from: env.SMTP_FROM || env.SMTP_USER || ''
		},
		notifyEmail: env.CONTACT_NOTIFY_EMAIL || ''
	};
}
