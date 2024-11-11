import OpenApp from "../open-app";

export default function Page({
  searchParams,
}: {
  searchParams?: { id: number };
}) {
  const id = searchParams?.id;
  return <OpenApp path={`education?id=${id}`} />;
}
