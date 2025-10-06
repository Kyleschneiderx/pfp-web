"use client";

import Button from "@/app/components/elements/Button";

export default function NotFound() {
	return (
		<div className="flex flex-col h-full justify-center items-center text-neutral-900 space-y-3">
			<p className="font-semibold text-3xl">Room Not Found</p>
			<p>We couldn't find the room you were looking for.</p>
			<Button onClick={() => window.close()} secondary label="Close" />
		</div>
	);
}
