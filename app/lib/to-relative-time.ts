import { formatDistanceToNow, differenceInMinutes, isToday, isThisWeek, isThisYear, format, parseISO } from "date-fns";

export const toRelativeTime = (timestamp: number | string | Date) => {
	// return formatDistanceToNow(timestamp, { addSuffix: true });

	const date = typeof timestamp === "string" ? parseISO(timestamp) : timestamp;
	const now = Date.now();

	const diffMins = differenceInMinutes(now, date);

	if (diffMins < 1) {
		return "just now";
	}

	if (diffMins < 60) {
		return `${diffMins}m`;
	}

	if (isToday(date)) {
		return format(date, "p"); // e.g. 3:42 PM
	}

	if (isThisWeek(date, { weekStartsOn: 1 })) {
		return format(date, "EEE"); // e.g. Mon, Tue
	}

	if (isThisYear(date)) {
		return format(date, "MMM d"); // e.g. Apr 15
	}

	return format(date, "MMM d, yyyy"); // e.g. Apr 15, 2023
};
