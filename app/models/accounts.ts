import type { Permission } from "./selection_model";

export type License = {
	license: string;
	state: string;
};

export type Account = {
	id: number;
	email: string;
	last_login_at: string | null;
	verified_at: string | null;
	roles: number[];
	created_at: string;
	updated_at: string;
	user_profile: UserProfile;
};

export type AccountPermission = {
	id: number;
	user_id: number;
	permission_id: number;
	permission: Permission;
	is_active: boolean;
};

type UserProfile = {
	name: string;
	birthdate: string | null;
	contact_number: string;
	description: string | null;
	npi: string;
	license: License[];
	photo: string | null;
};

export type AccountFormSchema = {
	id?: number;
	email: string;
	name: string;
	description: string;
	password: string;
	photo?: File;
};

export type AdminFormSchema = {
	id?: number;
	email: string;
	name: string;
	description: string;
	password: string;
	photo?: File;
};

export type ProviderFormSchema = {
	id?: number;
	email: string;
	name: string;
	description: string;
	password: string;
	npi: string;
	license: License[];
	photo?: File;
};
