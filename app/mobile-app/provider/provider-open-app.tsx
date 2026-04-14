"use client";

import OpenApp from "../open-app";

export default function ProviderOpenApp({ id }: { id?: string }) {
	if (!id) return null;
	return <OpenApp path={`invite?providerId=${id}`} />;
}
