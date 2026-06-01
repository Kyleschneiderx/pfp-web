import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Book a visit · Pelvic Floor Pro",
	description: "Schedule a pelvic health appointment with your provider.",
};

export default function BookingLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
