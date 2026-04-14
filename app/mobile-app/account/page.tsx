import OpenApp from "../open-app";

export default function Page({
	searchParams,
}: {
	searchParams?: { token: string };
}) {
	const token = searchParams?.token;
	return <OpenApp path={`account?token=${token}`} />;
}
