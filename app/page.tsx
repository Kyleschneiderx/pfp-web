import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import useAuth from "./hooks/useAuth";

export default function Home() {
	const cookieStore = cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/login");
	} else {
		redirect("/dashboard");
	}

	return null;
}
