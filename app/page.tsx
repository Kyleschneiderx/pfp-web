import { redirect } from "next/navigation";

export default function Home() {
  const isAuthenticated = true; // Example: await getSession() or check a cookie/token

  if (!isAuthenticated) {
    redirect("/login");
  } else {
    redirect("/dashboard");
  }

  return null;
}
