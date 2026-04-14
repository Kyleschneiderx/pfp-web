import type { Metadata } from "next";
import {
	buildCanonicalUrl,
	defaultOgImageUrl,
	fetchOpengraphProvider,
	resolveSiteOrigin,
} from "@/app/services/server_side/opengraph";
import ProviderOpenApp from "./provider-open-app";

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

	const og = await fetchOpengraphProvider(id);
	if (!og) {
		return { title: fallbackTitle, robots: { index: false } };
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
			type: "website",
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
	return <ProviderOpenApp id={id} />;
}
