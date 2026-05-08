import {
	buildCanonicalUrl,
	defaultOgImageUrl,
	fetchOpengraphEducation,
	resolveSiteOrigin,
} from "@/app/services/server_side/opengraph";
import type { Metadata } from "next";
import PfPlanOpenApp from "./pf-plan-open-app";

type Props = { searchParams?: Record<string, string | string[] | undefined> };

function firstParam(v: string | string[] | undefined): string | undefined {
	if (v === undefined) return undefined;
	return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
	const id = firstParam(searchParams?.id);
	const fallbackTitle = "Pelvic Floor Pro";

	if (!id) {
		return { title: fallbackTitle };
	}

	const og = await fetchOpengraphEducation(id);
	if (!og) {
		const siteOrigin = await resolveSiteOrigin();
		const canonicalUrl = new URL("/mobile-app/pf-plan", `${siteOrigin}/`);
		canonicalUrl.searchParams.set("id", id);
		const canonical = canonicalUrl.toString();
		const imageUrl = defaultOgImageUrl(siteOrigin);
		const fallbackDescription = fallbackTitle;

		return {
			title: fallbackTitle,
			description: fallbackDescription,
			openGraph: {
				title: fallbackTitle,
				description: fallbackDescription,
				url: canonical,
				images: [{ url: imageUrl }],
				type: "website",
			},
			twitter: {
				card: "summary_large_image",
				title: fallbackTitle,
				description: fallbackDescription,
				images: [imageUrl],
			},
			alternates: { canonical },
		};
	}

	const siteOrigin = await resolveSiteOrigin();
	const canonical = buildCanonicalUrl(siteOrigin, og.canonical_path);
	const imageUrl = og.image ?? defaultOgImageUrl(siteOrigin);

	return {
		title: og.title,
		description: og.description,
		openGraph: {
			title: og.title,
			description: og.description,
			url: canonical,
			images: [{ url: imageUrl }],
			type: "article",
		},
		twitter: {
			card: "summary_large_image",
			title: og.title,
			description: og.description,
			images: [imageUrl],
		},
		alternates: { canonical },
	};
}

export default function Page({ searchParams }: Props) {
	const id = firstParam(searchParams?.id);
	return <PfPlanOpenApp id={id} />;
}
