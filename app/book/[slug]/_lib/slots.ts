/**
 * Deterministic, front-end-only slot generation.
 *
 * Real availability will come from the scheduling API later. For now we derive
 * believable open/booked slots purely from the provider's weekly template plus
 * a stable hash of the date — so the calendar looks alive without a backend and
 * doesn't reshuffle on every render.
 */
import {
	addDays,
	addMinutes,
	format,
	isBefore,
	isSameDay,
	startOfDay,
} from "date-fns";
import type { WeeklyAvailability } from "../_data/providers";

export interface TimeSlot {
	/** ISO-ish key, unique per day+time. */
	id: string;
	/** Date object positioned at the slot's start time. */
	date: Date;
	/** "9:00 AM" style label. */
	label: string;
	available: boolean;
}

/** Cheap stable string hash → unsigned int. */
function hashString(input: string): number {
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = (hash << 5) - hash + input.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
}

function parseHm(base: Date, hm: string): Date {
	const [h, m] = hm.split(":").map(Number);
	const d = new Date(base);
	d.setHours(h, m, 0, 0);
	return d;
}

/**
 * Build the list of slots for a single day. Returns an empty array when the
 * provider doesn't work that weekday.
 */
export function getSlotsForDay(
	day: Date,
	availability: WeeklyAvailability,
	durationMinutes: number,
	slug: string,
): TimeSlot[] {
	const windows = availability[day.getDay()];
	if (!windows || windows.length === 0) return [];

	const now = new Date();
	const slots: TimeSlot[] = [];

	for (const window of windows) {
		let cursor = parseHm(day, window.start);
		const end = parseHm(day, window.end);

		while (addMinutes(cursor, durationMinutes) <= end || isSameDay(cursor, end)) {
			if (addMinutes(cursor, durationMinutes) > end) break;

			const key = `${slug}-${format(cursor, "yyyy-MM-dd-HHmm")}-${durationMinutes}`;
			const seed = hashString(key);

			// ~35% of slots read as already booked; past times are never bookable.
			const inPast = isBefore(cursor, now);
			const available = !inPast && seed % 100 > 35;

			slots.push({
				id: key,
				date: new Date(cursor),
				label: format(cursor, "h:mm a"),
				available,
			});

			cursor = addMinutes(cursor, durationMinutes);
		}
	}

	return slots;
}

/** Whether a day has at least one bookable slot — used to dot the calendar. */
export function dayHasAvailability(
	day: Date,
	availability: WeeklyAvailability,
	durationMinutes: number,
	slug: string,
): boolean {
	return getSlotsForDay(day, availability, durationMinutes, slug).some((s) => s.available);
}

/** First date (from today, up to `lookaheadDays`) that has an open slot. */
export function firstAvailableDay(
	availability: WeeklyAvailability,
	durationMinutes: number,
	slug: string,
	lookaheadDays = 60,
): Date {
	const start = startOfDay(new Date());
	for (let i = 0; i < lookaheadDays; i++) {
		const candidate = addDays(start, i);
		if (dayHasAvailability(candidate, availability, durationMinutes, slug)) {
			return candidate;
		}
	}
	return start;
}
