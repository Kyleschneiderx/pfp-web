"use client";

import Button from "@/app/components/elements/Button";

export default function NotFound() {
	return (
		<div className="flex flex-col min-h-screen justify-center items-center text-neutral-900 space-y-3 bg-cover bg-center bg-[url('/images/login-bg.png')]">
			<div className="absolute inset-0 bg-gradient-to-r from-primary-50/95 to-primary-50/70" />
			<div className="flex flex-col justify-center items-center z-20 space-y-3">
				<p className="font-semibold text-3xl">Content Not Found</p>
				<p>We couldn't find the content you were looking for.</p>
				<div className="flex items-center space-x-3">
					<Button
						onClick={() => (window.history.length > 1 ? window.history.back() : window.close())}
						secondary
						label="Back"
					/>
					<Button onClick={() => window.location.replace("/dashboard")} label="Dashboard" />
				</div>
			</div>
		</div>
	);
}
