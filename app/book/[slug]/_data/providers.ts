/**
 * Mock provider data for the patient-facing scheduling experience.
 *
 * NOTE: This is front-end / design-only. There is no API wired up yet — these
 * records simulate what the backend would eventually return for a given
 * provider booking link (`/book/[slug]`). The `slug` is the unique, shareable
 * link each provider hands out to patients.
 */

export type VisitMode = "telehealth" | "in-person";

export interface VisitType {
	id: string;
	label: string;
	blurb: string;
	durationMinutes: number;
	priceLabel: string;
	mode: VisitMode;
}

/** Weekly availability template: keys are JS weekday indexes (0 = Sunday). */
export type WeeklyAvailability = Record<number, { start: string; end: string }[]>;

export interface BookingProvider {
	slug: string;
	name: string;
	credentials: string;
	title: string;
	/** Two-letter monogram used for the gradient avatar. */
	monogram: string;
	/** Tailwind gradient classes used to color the avatar / accents. */
	accent: { from: string; to: string };
	bio: string;
	rating: number;
	reviewCount: number;
	yearsExperience: number;
	practice: string;
	addressLine: string;
	city: string;
	state: string;
	/** IANA timezone + a friendly label to show patients. */
	timezone: string;
	timezoneLabel: string;
	visitTypes: VisitType[];
	availability: WeeklyAvailability;
}

const WEEKDAY_9_TO_5: WeeklyAvailability = {
	1: [{ start: "09:00", end: "17:00" }],
	2: [{ start: "09:00", end: "17:00" }],
	3: [{ start: "09:00", end: "17:00" }],
	4: [{ start: "09:00", end: "17:00" }],
	5: [{ start: "09:00", end: "15:00" }],
};

export const PROVIDERS: BookingProvider[] = [
	{
		slug: "dr-amara-okafor",
		name: "Dr. Amara Okafor",
		credentials: "PT, DPT, WCS",
		title: "Pelvic Health Physical Therapist",
		monogram: "AO",
		accent: { from: "from-primary-500", to: "to-secondary-500" },
		bio: "Board-certified women's health specialist with a gentle, whole-body approach to pelvic floor recovery. Amara works with patients through pregnancy, postpartum, and beyond.",
		rating: 4.9,
		reviewCount: 218,
		yearsExperience: 12,
		practice: "Riverbend Pelvic Health",
		addressLine: "1820 Marina Blvd, Suite 210",
		city: "San Francisco",
		state: "CA",
		timezone: "America/Los_Angeles",
		timezoneLabel: "Pacific Time",
		visitTypes: [
			{
				id: "telehealth-eval",
				label: "Virtual Initial Evaluation",
				blurb: "A thorough video consult to understand your history and build a plan.",
				durationMinutes: 50,
				priceLabel: "$160",
				mode: "telehealth",
			},
			{
				id: "telehealth-followup",
				label: "Virtual Follow-up",
				blurb: "Check in on progress and adjust your home program over video.",
				durationMinutes: 30,
				priceLabel: "$95",
				mode: "telehealth",
			},
			{
				id: "inperson-eval",
				label: "In-Person Initial Evaluation",
				blurb: "Hands-on assessment at the Marina clinic.",
				durationMinutes: 60,
				priceLabel: "$210",
				mode: "in-person",
			},
		],
		availability: WEEKDAY_9_TO_5,
	},
	{
		slug: "dr-julian-reyes",
		name: "Dr. Julian Reyes",
		credentials: "PT, DPT",
		title: "Men's Pelvic Health & Recovery",
		monogram: "JR",
		accent: { from: "from-success-500", to: "to-primary-500" },
		bio: "Julian specializes in post-surgical and athletic pelvic rehabilitation, helping patients rebuild strength and confidence with evidence-based, progressive programming.",
		rating: 4.8,
		reviewCount: 134,
		yearsExperience: 8,
		practice: "Summit Sports & Pelvic PT",
		addressLine: "44 Pearl Street, Floor 3",
		city: "Denver",
		state: "CO",
		timezone: "America/Denver",
		timezoneLabel: "Mountain Time",
		visitTypes: [
			{
				id: "telehealth-eval",
				label: "Virtual Initial Evaluation",
				blurb: "Video consult covering history, goals, and a starting plan.",
				durationMinutes: 45,
				priceLabel: "$150",
				mode: "telehealth",
			},
			{
				id: "inperson-eval",
				label: "In-Person Initial Evaluation",
				blurb: "Comprehensive movement and pelvic floor assessment in-clinic.",
				durationMinutes: 60,
				priceLabel: "$195",
				mode: "in-person",
			},
			{
				id: "inperson-followup",
				label: "In-Person Treatment Session",
				blurb: "Hands-on treatment and progressive exercise programming.",
				durationMinutes: 45,
				priceLabel: "$140",
				mode: "in-person",
			},
		],
		availability: {
			1: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "18:00" }],
			3: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "18:00" }],
			4: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "18:00" }],
			6: [{ start: "09:00", end: "13:00" }],
		},
	},
	{
		slug: "dr-priya-nair",
		name: "Dr. Priya Nair",
		credentials: "PT, DPT, PRPC",
		title: "Pelvic Floor & Postpartum Care",
		monogram: "PN",
		accent: { from: "from-accents-900", to: "to-primary-500" },
		bio: "Priya blends manual therapy, breathwork, and education to support patients through postpartum healing, persistent pelvic pain, and bladder health.",
		rating: 5.0,
		reviewCount: 87,
		yearsExperience: 6,
		practice: "Lotus Pelvic Wellness",
		addressLine: "905 Congress Ave, Suite 5",
		city: "Austin",
		state: "TX",
		timezone: "America/Chicago",
		timezoneLabel: "Central Time",
		visitTypes: [
			{
				id: "telehealth-consult",
				label: "Free 15-min Discovery Call",
				blurb: "Not sure where to start? A quick video chat to see if we're a fit.",
				durationMinutes: 15,
				priceLabel: "Free",
				mode: "telehealth",
			},
			{
				id: "telehealth-eval",
				label: "Virtual Initial Evaluation",
				blurb: "Full intake and personalized plan, all over secure video.",
				durationMinutes: 50,
				priceLabel: "$155",
				mode: "telehealth",
			},
			{
				id: "inperson-eval",
				label: "In-Person Initial Evaluation",
				blurb: "In-clinic assessment with hands-on manual therapy.",
				durationMinutes: 60,
				priceLabel: "$200",
				mode: "in-person",
			},
		],
		availability: {
			2: [{ start: "10:00", end: "18:00" }],
			3: [{ start: "10:00", end: "18:00" }],
			4: [{ start: "10:00", end: "18:00" }],
			5: [{ start: "09:00", end: "14:00" }],
		},
	},
];

export function getProviderBySlug(slug: string): BookingProvider | undefined {
	return PROVIDERS.find((p) => p.slug === slug);
}
