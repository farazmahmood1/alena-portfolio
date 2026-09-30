import nodemailer from 'nodemailer';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const FIELDS = [
	['Name', (l) => [l.salutation, l.fullName].filter(Boolean).join(' ')],
	['Email', (l) => l.email],
	['Phone', (l) => l.phone],
	['Project type', (l) => l.projectType],
	['Start', (l) => l.timeline],
	['First call by', (l) => l.callPreference],
	['Message', (l) => l.message],
	['Source page', (l) => l.sourcePage],
	['Referrer', (l) => l.referrer],
	['UTM', (l) => (l.utm ? Object.entries(l.utm).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ') : '')],
	['Received', (l) => new Date(l.createdAt || Date.now()).toISOString()]
];

export function formatLeadEmail(lead) {
	const rows = FIELDS.map(([label, get]) => [label, get(lead)]).filter(([, v]) => v);
	return {
		subject: `New enquiry: ${lead.fullName}${lead.projectType ? ` | ${lead.projectType}` : ''}`,
		text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
		html: `<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows
			.map(([k, v]) => `<tr><th align="left" valign="top">${escapeHtml(k)}</th><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
			.join('')}</table>`
	};
}

// Returns { enabled, send(lead) }. Without SMTP settings the mailer is disabled and leads are only stored.
export function createMailer(config) {
	const { smtp, notifyEmail } = config;
	if (!smtp.host || !notifyEmail) return { enabled: false, async send() {} };
	const transport = nodemailer.createTransport({
		host: smtp.host,
		port: smtp.port,
		secure: smtp.port === 465,
		auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined
	});
	return {
		enabled: true,
		async send(lead) {
			const { subject, text, html } = formatLeadEmail(lead);
			await transport.sendMail({ from: smtp.from, to: notifyEmail, replyTo: lead.email, subject, text, html });
		}
	};
}
