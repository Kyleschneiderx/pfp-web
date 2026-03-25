import { format, isValid, parseISO } from "date-fns";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeScheduleYmd(value: unknown): string | null {
	if (value == null || value === "") {
		return null;
	}
	const s = String(value).trim();
	const ymd = s.length >= 10 ? s.slice(0, 10) : s;
	if (!YMD.test(ymd)) {
		return null;
	}
	const d = parseISO(ymd);
	return isValid(d) ? ymd : null;
}

export type ScheduleDateRow = {
	date_start?: string | null;
	date_end?: string | null;
	dateStart?: string | null;
	dateEnd?: string | null;
};

export function getScheduleDateBounds(row: ScheduleDateRow): {
	start: string | null;
	end: string | null;
} {
	const start = normalizeScheduleYmd(row.date_start) ?? normalizeScheduleYmd(row.dateStart);
	const end = normalizeScheduleYmd(row.date_end) ?? normalizeScheduleYmd(row.dateEnd);
	return { start, end };
}

export function hasCustomDateRange(row: ScheduleDateRow): boolean {
	const { start, end } = getScheduleDateBounds(row);
	return start != null && end != null;
}

export function formatScheduleDateRangeList(row: ScheduleDateRow): string {
	const { start, end } = getScheduleDateBounds(row);
	if (start == null || end == null) {
		return "N/A";
	}
	const ds = parseISO(start);
	const de = parseISO(end);
	if (!isValid(ds) || !isValid(de)) {
		return "N/A";
	}
	return `${format(ds, "MMM d")} - ${format(de, "MMM d")}`;
}
