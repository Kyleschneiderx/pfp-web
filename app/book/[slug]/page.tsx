import { notFound } from "next/navigation";
import BookingExperience from "./_components/BookingExperience";
import { PROVIDERS, getProviderBySlug } from "./_data/providers";

interface Props {
	params: { slug: string };
}

// Pre-render each known provider's link at build time.
export function generateStaticParams() {
	return PROVIDERS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props) {
	const provider = getProviderBySlug(params.slug);
	if (!provider) return { title: "Provider not found · Pelvic Floor Pro" };
	return {
		title: `Book with ${provider.name} · Pelvic Floor Pro`,
		description: `Schedule a pelvic health visit with ${provider.name}, ${provider.credentials}.`,
	};
}

export default function ProviderBookingPage({ params }: Props) {
	const provider = getProviderBySlug(params.slug);
	if (!provider) notFound();

	return <BookingExperience provider={provider} />;
}
