"use client";

import Button from "@/app/components/elements/Button";

export default function NotFound() {
	return (
		<div className="flex flex-col h-full justify-center items-center text-neutral-900 space-y-3">
			<p className="font-semibold text-3xl">Content Not Found</p>
			<p>We couldn't find the content you were looking for.</p>
			<Button
				onClick={() => (window.history.length > 1 ? window.history.back() : window.close())}
				secondary
				label="Back"
			/>
		</div>
	);
}
