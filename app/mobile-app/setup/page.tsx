import OpenApp from "../open-app";

export default function Page({
  searchParams,
}: {
  searchParams?: { token: String };
}) {
  const token = searchParams?.token;
  return <OpenApp path={`setup?token=${token}`} />;
}
