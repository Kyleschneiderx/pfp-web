import { headers } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const API_ADMIN_SUFFIX = "/api/admin";
const API_SUFFIX = "/api";

function opengraphFetchOrigin(): string {
	const trimmed = API_BASE.replace(/\/$/, "");
	if (trimmed.endsWith(API_ADMIN_SUFFIX)) {
		return trimmed.slice(0, -API_ADMIN_SUFFIX.length);
	}
	if (trimmed.endsWith(API_SUFFIX)) {
		return trimmed.slice(0, -API_SUFFIX.length);
	}
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

/** Optional override; otherwise uses this request's Host / X-Forwarded-* (ALB) or localhost in dev. */
export async function resolveSiteOrigin(): Promise<string> {
	const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
	if (fromEnv) return fromEnv;

	const h = await headers();
	const host = h.get("x-forwarded-host")?.split(",")[0]?.trim() || h.get("host")?.trim();
	let proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim()?.toLowerCase();
	if (proto !== "http" && proto !== "https") {
		proto = "https";
	}
	if (host) {
		return `${proto}://${host}`;
	}

	return "http://localhost:3000";
}

export function buildCanonicalUrl(siteOrigin: string, canonicalPath: string): string {
	const base = siteOrigin.replace(/\/$/, "");
	return new URL(canonicalPath, `${base}/`).toString();
}

export function defaultOgImageUrl(siteOrigin: string): string {
	return buildCanonicalUrl(siteOrigin, "/images/og-default.png");
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
