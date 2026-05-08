"use client";

import OpenApp from "../open-app";

export default function PfPlanOpenApp({ id }: { id?: string }) {
	if (!id) return null;
	return <OpenApp path={`pf-plan?id=${id}`} />;
}
