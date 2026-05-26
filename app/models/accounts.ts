import type { Permission } from "./selection_model";

export type License = {
	license: string;
	state: string;
};

export type Address = {
	id?: number;
	user_id?: number;
	line1: string;
	line2?: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
	latitude?: number;
	longitude?: number;
	created_at?: string;
	updated_at?: string;
};

export type UserProfileSettings = {
	in_person_visit: boolean;
};

export type AccountAddressesPayload = {
	addresses: Address[];
};

export type AccountSettingsPayload = {
	settings: UserProfileSettings;
};

export type NearbyProviderSearchParams = {
	latitude: number;
	longitude: number;
	radius_km?: number;
	limit?: number;
	in_person_visit?: boolean;
};

export type Account = {
	id: number;
	email: string;
	type_id?: number;
	account_type_id?: number;
	status_id?: number;
	last_login_at: string | null;
	verified_at: string | null;
	roles: number[];
	created_at: string;
	updated_at: string;
	distance_km?: number;
	user_profile: UserProfile;
	addresses?: Address[];
	settings?: UserProfileSettings;
};

export type NearbyProvider = Account & {
	distance_km: number;
};

export type AccountPermission = {
	id: number;
	user_id: number;
	permission_id: number;
	permission: Permission;
	is_active: boolean;
};

export type UserProfile = {
	name: string;
	birthdate: string | null;
	contact_number: string | null;
	description: string | null;
	npi: string | null;
	license: License[] | null;
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
	role_id: number;
	addresses: Address[];
	in_person_visit: boolean;
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
	role_id: number;
	addresses: Address[];
	in_person_visit: boolean;
};
