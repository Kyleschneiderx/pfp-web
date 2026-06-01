import Card from "@/app/components/elements/Card";
import { CalendarX2 } from "lucide-react";
import Link from "next/link";
import { PROVIDERS } from "./_data/providers";

export default function BookingNotFound() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-primary-50 px-6 py-16 text-neutral-900">
			<Card className="w-full max-w-md p-8 text-center">
				<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-primary-100">
					<CalendarX2 className="h-8 w-8 text-primary-500" strokeWidth={1.5} />
				</div>
				<h1 className="text-2xl font-bold text-neutral-900">We couldn&rsquo;t find that link</h1>
				<p className="mt-3 text-neutral-600">
					This scheduling link may have changed or expired. Double-check the address from your
					provider, or pick one of our specialists below.
				</p>

				<div className="mt-8 grid gap-2 text-left">
					{PROVIDERS.map((p) => (
						<Link
							key={p.slug}
							href={`/book/${p.slug}`}
							className="group flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 transition hover:border-primary-600 hover:bg-primary-50"
						>
							<span className="font-medium">{p.name}</span>
							<span className="text-sm text-neutral-500 group-hover:text-primary-600">
								{p.title}
							</span>
						</Link>
					))}
				</div>
			</Card>
		</main>
	);
}
