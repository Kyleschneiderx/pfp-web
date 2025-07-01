export const stringToInitial = (string?: string, length = 2) => {
	if (!string) return string;

	return string
		?.split(" ")
		.map((n: string) => n[0].toUpperCase())
		.slice(0, 2)
		.join("");
};
