import OpenApp from "../open-app";

export default function Page({
	searchParams,
}: {
	searchParams?: { token: string };
}) {
	return <OpenApp />;
}
