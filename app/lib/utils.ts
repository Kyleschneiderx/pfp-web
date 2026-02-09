import { format, set } from "date-fns";
import { convertToRaw, EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";

// return format: 1988-11-23
export const formatDate = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

// return format: December 25, 1998. Accepts ISO 8601 strings or YYYY-MM-DD.
export const formatDateToLocal = (dateStr: string | Date) => {
	let date: Date;

	if (typeof dateStr === "string") {
		date = new Date(dateStr);
		if (Number.isNaN(date.getTime())) {
			const dateParts = dateStr.split("-").map(Number);
			if (
				dateParts.length !== 3 ||
				dateParts[0] <= 0 ||
				dateParts[1] <= 0 ||
				dateParts[1] > 12 ||
				dateParts[2] <= 0 ||
				dateParts[2] > 31
			) {
				return "N/A";
			}
			const [year, month, day] = dateParts;
			date = new Date(year, month - 1, day);
		}
	} else {
		date = new Date(dateStr);
	}

	if (Number.isNaN(date.getTime())) {
		return "N/A";
	}

	const formatter = new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return formatter.format(date);
};

export const formatDatetime = (date: string | Date, formatString = "yyyy-MM-dd'T'HH:mm:ss'Z'") => {
	return format(date, formatString);
};

export const dateToUtc = (date: string | Date) => {
	const newDate = typeof date === "string" ? new Date(date) : date;
	return new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000);
};

export const validateEmail = (email: string): boolean => {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
};

export const validateName = (name: string): boolean => {
	const re = /^[a-zA-Z\s'-.]+$/;
	return re.test(name);
};

export const onPhoneNumKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
	// Allow only numbers, hypen, backspace, delete and arrow keys
	if (
		!/[0-9]/.test(e.key) &&
		e.key !== "Backspace" &&
		e.key !== "Delete" &&
		e.key !== "ArrowLeft" &&
		e.key !== "ArrowRight"
	) {
		e.preventDefault();
	}
};

export const getLastLoginStatus = (dateString: string): string => {
	const givenDate = new Date(dateString);
	const currentDate = new Date();

	// Calculate the difference in time
	const diffTime = currentDate.getTime() - givenDate.getTime();

	// Convert difference to days
	const diffDays = diffTime / (1000 * 3600 * 24);

	// Return "Active" if within the last 31 days
	if (diffDays < 31) {
		return "Active";
	}

	// Calculate the difference in months
	const diffMonths = Math.floor(diffDays / 30); // Rough approximation for months

	if (diffMonths === 1) {
		return "Last login a month ago";
	} else {
		return `Last login ${diffMonths} months ago`;
	}
};

export const getFileContentType = (file: File): string => {
	const ext = file.name.split(".").pop()!.toLowerCase();
	switch (ext) {
		case "mp4":
			return "video/mp4";
		case "avi":
			return "video/x-msvideo"; // Common MIME type for .avi
		case "mov":
			return "video/quicktime"; // Common MIME type for .mov
		case "wmv":
			return "video/x-ms-wmv"; // Common MIME type for .wmv
		case "mkv":
			return "video/x-matroska"; // Common MIME type for .mkv
		default:
			return "application/octet-stream";
	}
};

export const convertDraftjsToHtml = (editorState: EditorState) => {
	const rawContentState = convertToRaw(editorState.getCurrentContent());
	let htmlContent = draftToHtml(rawContentState);
	htmlContent = htmlContent.replace(/<a /g, '<a style="color: blue; text-decoration: underline;" ');
	htmlContent = htmlContent.replace(/<h1>/g, '<h1 style="font-size: 1.5rem; font-weight: bold;">');
	htmlContent = htmlContent.replace(/<ul>/g, '<ul style="margin: 0;">');
	htmlContent = htmlContent.replace(/<li>/g, '<li style="margin: 0; padding: 0;">');
	// Fix image tags with undefined attributes
	htmlContent = htmlContent.replace(
		/<img src="([^"]+)" alt="undefined" style="height: undefined;width: undefined"\/?>/g,
		(match, src) => `<img src="${src}" alt="" style="height: auto; width: auto; max-width: 100%" />`,
	);
	return htmlContent;
};

export const truncatedText = (text: string, max: number): string => {
	return text.length > max ? text.substring(0, max) + "..." : text;
};

export type WeekRange = {
	startOfWeek: Date;
	endOfWeek: Date;
};

// Helper function to get the start (sunday) and end (saturday) of the week
export const getWeekRange = (date: Date): WeekRange => {
	const dayOfWeek = date.getDay(); // 0 is sunday, 6 is saturday
	const startOfWeek = new Date(date);
	const endOfWeek = new Date(date);

	// Set start to Sunday
	startOfWeek.setDate(date.getDate() - dayOfWeek);
	// Set end to Saturday
	endOfWeek.setDate(date.getDate() + (6 - dayOfWeek));

	return { startOfWeek, endOfWeek };
};

export const capitalizeFirstLetter = (string: string | null | undefined): string | null | undefined => {
	if (!string) return string; // Handle empty or undefined strings
	return string.charAt(0).toUpperCase() + string.slice(1);
};

export const timeToDate = (time: string, formatString = "yyyy-MM-dd HH:mm:ss") => {
	let hours = 0;
	let minutes = 0;
	let seconds = 0;

	// Split by space
	const parts = time.trim().split(" ");

	let timePart = "";
	let period = "";

	if (parts.length === 1) {
		// Only time, e.g., "14:30" or "02:30"
		timePart = parts[0];
	} else if (parts.length === 2) {
		// Could be "02:30 PM" or "2025-09-14 14:30"
		if (["am", "pm"].includes(parts[1].toLowerCase())) {
			timePart = parts[0];
			period = parts[1];
		} else {
			// Assume first part is date, second is time
			timePart = parts[1];
		}
	} else if (parts.length === 3) {
		// e.g., "2025-09-14 02:30 PM"
		timePart = parts[1];
		period = parts[2];
	}

	const timeSegments = timePart.split(":");
	hours = Number(timeSegments[0]);
	minutes = Number(timeSegments[1]);
	seconds = Number(timeSegments[2] ?? 0);

	if (period) {
		// Convert 12-hour to 24-hour
		if (period.toLowerCase() === "pm" && hours !== 12) hours += 12;
		if (period.toLowerCase() === "am" && hours === 12) hours = 0;
	}

	return format(set(new Date(), { hours, minutes, seconds }), formatString);
};

export const hasFieldError = (
	fieldName: string,
	errors?:
		| ({ path?: string; msg: string } & Record<string, any>[])
		| ({ path?: string; msg: string } & Record<string, any>),
) => {
	if (!Array.isArray(errors)) {
		return errors?.path === fieldName;
	}

	return errors?.some((error) => error.path === fieldName);
};

export const toFormData = (data: Record<string, any>) => {
	const formData = new FormData();
	for (const [key, value] of Object.entries(data)) {
		if (!value) continue;

		if (Array.isArray(value)) {
			formData.append(key, JSON.stringify(value));
		} else {
			formData.append(key, value);
		}
	}

	return formData;
};
