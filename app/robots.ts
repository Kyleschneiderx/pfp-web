import { resolveSiteHost } from "@/app/services/server_side/opengraph";
import type { MetadataRoute } from "next";

const socialUserAgents = [
	"facebookexternalhit",
	"Facebot",
	"Instagram",
	"Pinterestbot",
	"Twitterbot",
	"LinkedInBot",
	"TelegramBot",
	"WhatsApp",
	"Slackbot",
	"Discordbot",
	"redditbot",
	"Redditbot",
	"Bytespider",
	"Applebot",
	"Snapchat",
	"SkypeUriPreview",
];

// `host` uses NEXT_PUBLIC_SITE_URL when set; otherwise the incoming Host / X-Forwarded-* (same as mobile-app OG URLs).
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
	const host = await resolveSiteHost();
	return {
		rules: [
			{
				userAgent: socialUserAgents,
				allow: "/",
			},
			{ userAgent: "*", allow: "/" },
		],
		host,
	};
}
