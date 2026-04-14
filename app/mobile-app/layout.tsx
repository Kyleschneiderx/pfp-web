import type { Metadata } from "next";
import { siteOrigin } from "@/app/services/server_side/opengraph";

export const metadata: Metadata = {
	metadataBase: new URL(siteOrigin()),
};

export default function MobileAppLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
