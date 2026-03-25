import OpenApp from "../open-app";

export default function Page({
	searchParams,
}: {
	searchParams?: { token: String };
}) {
	return <OpenApp />;
}
