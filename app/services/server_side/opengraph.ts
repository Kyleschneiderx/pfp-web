const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Host for top-level API routes (e.g. /opengraph). Strips trailing /api from NEXT_PUBLIC_API_BASE_URL. */
function opengraphFetchOrigin(): string {
	const trimmed = API_BASE.replace(/\/$/, "");
	if (trimmed.endsWith("/api")) return trimmed.slice(0, -4);
	return trimmed;
}

export type OpengraphPayload = {
	type: string;
	title: string;
	description: string;
	image: string | null;
	canonical_path: string;
	reference_pf_plan_id?: number | null;
};

export function siteOrigin(): string {
	const explicit = process.env.NEXT_PUBLIC_SITE_URL;
	if (explicit) return explicit.replace(/\/$/, "");
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
	return "http://localhost:3000";
}

export function buildCanonicalUrl(canonicalPath: string): string {
	const base = siteOrigin();
	return new URL(canonicalPath, `${base}/`).toString();
}

export function defaultOgImageUrl(): string {
	return buildCanonicalUrl("/images/og-default.png");
}

async function fetchOpengraph(path: string): Promise<OpengraphPayload | null> {
	const origin = opengraphFetchOrigin();
	if (!origin) return null;
	const url = `${origin.replace(/\/$/, "")}${path}`;
	const res = await fetch(url, { next: { revalidate: 120 } });
	if (!res.ok) return null;
	return (await res.json()) as OpengraphPayload;
}

export async function fetchOpengraphEducation(id: string): Promise<OpengraphPayload | null> {
	if (!id) return null;
	return fetchOpengraph(`/opengraph/educations/${encodeURIComponent(id)}`);
}

export async function fetchOpengraphProvider(userId: string): Promise<OpengraphPayload | null> {
	if (!userId) return null;
	return fetchOpengraph(`/opengraph/providers/${encodeURIComponent(userId)}`);
}
