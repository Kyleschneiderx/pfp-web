"use client";

import OpenApp from "../open-app";

export default function EducationOpenApp({ id }: { id?: string }) {
	if (!id) return null;
	return <OpenApp path={`education?id=${id}`} />;
}
