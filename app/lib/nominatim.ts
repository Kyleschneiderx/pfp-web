import type { Address } from "@/app/models/accounts";

export type NominatimAddressDetails = {
	house_number?: string;
	road?: string;
	suburb?: string;
	city?: string;
	town?: string;
	village?: string;
	municipality?: string;
	county?: string;
	state?: string;
	region?: string;
	postcode?: string;
	country?: string;
};

export type NominatimSearchResult = {
	place_id: number;
	lat: string;
	lon: string;
	display_name: string;
	address?: NominatimAddressDetails;
};

export function nominatimResultToAddress(result: NominatimSearchResult): Address {
	const details = result.address ?? {};
	const line1Parts = [details.house_number, details.road].filter(Boolean);
	const line1 = line1Parts.length > 0 ? line1Parts.join(" ") : (result.display_name.split(",")[0]?.trim() ?? "");

	return {
		line1,
		line2: details.suburb,
		city: details.city ?? details.town ?? details.village ?? details.municipality ?? "",
		state: details.state ?? details.region ?? details.county ?? "",
		postal_code: details.postcode ?? "",
		country: details.country ?? "",
		latitude: Number.parseFloat(result.lat),
		longitude: Number.parseFloat(result.lon),
	};
}

export async function searchNominatim(query: string): Promise<NominatimSearchResult[]> {
	const trimmed = query.trim();
	if (!trimmed) {
		return [];
	}

	const url = new URL("https://nominatim.openstreetmap.org/search");
	url.searchParams.set("format", "json");
	url.searchParams.set("q", trimmed);
	url.searchParams.set("addressdetails", "1");
	url.searchParams.set("limit", "5");

	const response = await fetch(url.toString(), {
		headers: {
			"User-Agent": "PelvicFloorPro/1.0",
		},
	});

	if (!response.ok) {
		throw new Error("Address search failed");
	}

	const data = (await response.json()) as NominatimSearchResult[];
	return data;
}
