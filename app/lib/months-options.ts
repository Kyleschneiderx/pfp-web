import type { OptionsModel } from "../models/common_model";

const currentYear = new Date().getFullYear();

export const monthOptions: OptionsModel[] = Array.from({ length: 12 }, (_, index) => {
	const monthIndex = index;
	const date = new Date(currentYear, monthIndex); // year and day can be arbitrary
	const shortMonth = date.toLocaleString("en-US", { month: "short" });

	return { label: shortMonth, value: (monthIndex + 1).toString().padStart(2, "0") };
});
