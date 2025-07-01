import Cookies from "js-cookie";
import { useLogout } from "./useLogout";
import type { PatientModel } from "../models/patient_model";

export default function useAuth() {
	const logout = useLogout();

	const cookieUser = Cookies.get("user");
	if (!cookieUser) {
		logout();
		console.error("Failed to get authenticated user.");
	}

	const user = JSON.parse(cookieUser as string) as PatientModel;

	return user;
}
