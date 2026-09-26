import { z } from 'zod';

const REQUIRED = 'This field is required';
const optionalText = (max) => z.string().trim().max(max).optional().transform((v) => v || undefined);

// Mirrors the fields of the contact form on /contact. Messages are shown under each field.
export const contactSchema = z
	.object({
		salutation: optionalText(40),
		fullName: z.string({ required_error: REQUIRED }).trim().min(1, REQUIRED).max(120, 'Please use 120 characters or fewer'),
		email: z.string({ required_error: REQUIRED }).trim().min(1, REQUIRED).max(254).email('Please enter a valid email address'),
		phone: z
			.string()
			.trim()
			.max(40)
			.regex(/^[+()\d\s.-]*$/, 'Please enter a valid phone number')
			.optional()
			.transform((v) => v || undefined),
		projectType: z.string({ required_error: REQUIRED }).trim().min(1, REQUIRED).max(120),
		timeline: optionalText(120),
		callPreference: optionalText(60),
		message: optionalText(5000),
		privacyAccepted: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy policy' }) }),
		sourcePage: optionalText(500),
		referrer: optionalText(500),
		utm: z
			.object({
				source: optionalText(200),
				medium: optionalText(200),
				campaign: optionalText(200),
				term: optionalText(200),
				content: optionalText(200)
			})
			.partial()
			.optional(),
		// Honeypot: hidden from people, filled in by bots.
		hp: z.string().optional()
	})
	.superRefine((data, ctx) => {
		// The form only shows (and requires) the phone field when a phone call is chosen.
		if (data.callPreference === 'Phone' && !data.phone) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: REQUIRED });
		}
	});

// Flatten zod issues into { field: firstMessage }.
export function fieldErrors(error) {
	const out = {};
	for (const issue of error.issues) {
		const key = issue.path.join('.') || 'form';
		if (!out[key]) out[key] = issue.message;
	}
	return out;
}
