import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { ROLES } from "../lib/constants";
import type { Account, AccountPermission } from "../models/accounts";
import type { ErrorModel } from "../models/error_model";
import { getAccountPermissions } from "../services/client_side/accounts";
import { syncAccount } from "../services/client_side/auth";
import { useLogout } from "./useLogout";

type Auth = {
	user?: Account | null;
	permissions?: string[] | null;
	isAdmin: boolean;
	isProvider: boolean;
	sync: () => Promise<void>;
	hasPermission: (permission: string | string[]) => boolean;
	isLoaded: boolean;
};

const setCookie = (name: string, value: string, expiresAt: number) => {
	Cookies.set(name, value, {
		expires: Math.ceil((expiresAt - Date.now() / 1000) / 3600) / 24,
		sameSite: "Strict",
		secure: true, // enable this if the server is already https
	});
};

export default function useAuth() {
	const logout = useLogout();

	const sync = async () => {
		try {
			const tokenExpiration = Number(Cookies.get("token_expiration") ?? 0);
			if (!tokenExpiration) {
				console.error("Failed to get authenticated user.");
				logout();
			}

			const response = await syncAccount();

			localStorage.setItem("user", JSON.stringify(response.user));
			localStorage.setItem("permissions", JSON.stringify(response.permissions));
		} catch (e) {
			const error = e as ErrorModel;
			console.error(error);
		}
	};

	const [auth, setAuth] = useState<Auth>({
		user: null,
		permissions: null,
		isAdmin: false,
		isProvider: false,
		sync,
		hasPermission: () => false,
		isLoaded: false,
	});

	useEffect(() => {
		const storageUser = localStorage.getItem("user");
		if (!storageUser) {
			console.error("Failed to get authenticated user.");
			logout();
		}

		const user = JSON.parse(storageUser as string) as Account;

		const storagePermissions = localStorage.getItem("permissions");

		const permissions = storagePermissions ? (JSON.parse(storagePermissions as string) as AccountPermission[]) : null;

		const parsedPermissions = permissions?.map((permission) => permission.permission.key);

		const isAdmin = user.roles.includes(ROLES.ADMIN);

		const isProvider = user.roles.includes(ROLES.PROVIDER);

		const hasPermission = (permission: string | string[]): boolean => {
			if (isAdmin) return true;

			if (!Array.isArray(permission)) return parsedPermissions?.includes(permission) ?? false;

			return permission.some((p) => parsedPermissions?.includes(p) ?? false);
		};

		setAuth({
			user,
			permissions: parsedPermissions,
			isAdmin,
			isProvider,
			sync,
			hasPermission,
			isLoaded: true,
		});
	}, []);

	return auth;
}
