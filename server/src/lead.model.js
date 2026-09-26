import mongoose from 'mongoose';

// One enquiry from the contact form. Stores exactly what the form sends, plus where it came from.
const leadSchema = new mongoose.Schema(
	{
		salutation: { type: String, trim: true, maxlength: 40 },
		fullName: { type: String, required: true, trim: true, maxlength: 120 },
		email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
		phone: { type: String, trim: true, maxlength: 40 },
		projectType: { type: String, trim: true, maxlength: 120 },
		timeline: { type: String, trim: true, maxlength: 120 },
		callPreference: { type: String, trim: true, maxlength: 60 },
		message: { type: String, trim: true, maxlength: 5000 },
		privacyAccepted: { type: Boolean, required: true },
		sourcePage: { type: String, trim: true, maxlength: 500 },
		referrer: { type: String, trim: true, maxlength: 500 },
		utm: {
			source: { type: String, trim: true, maxlength: 200 },
			medium: { type: String, trim: true, maxlength: 200 },
			campaign: { type: String, trim: true, maxlength: 200 },
			term: { type: String, trim: true, maxlength: 200 },
			content: { type: String, trim: true, maxlength: 200 }
		},
		status: { type: String, enum: ['new', 'contacted', 'qualified', 'won', 'lost', 'spam'], default: 'new', index: true },
		notification: {
			status: { type: String, enum: ['pending', 'sent', 'failed', 'disabled'], default: 'pending' },
			error: { type: String, maxlength: 500 }
		}
	},
	{ timestamps: true }
);

leadSchema.index({ createdAt: -1 });

export const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
