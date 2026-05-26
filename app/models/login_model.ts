import type { Account, AccountPermission } from "./accounts";

export type LoginModel = {
	has_twofa?: boolean;
	twofa_secret?: string;
	qr_code?: string;
	user: Account;
	permissions: AccountPermission[];
	token: {
		access: string;
		firestore: string;
		expires: number;
	};
};

export type AuthProfileModel = Pick<LoginModel, "user" | "permissions">;
