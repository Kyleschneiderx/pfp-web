import OpenApp from "../open-app";

export default function Page({
	searchParams,
}: {
	searchParams?: { email: string };
}) {
	const email = searchParams?.email;
	return <OpenApp path={`account?email=${email}`} />;
}
