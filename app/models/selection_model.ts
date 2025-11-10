export interface CptCode {
	id?: number;
	code: string;
	name: string;
	description: string;
	is_timed: boolean;
}

export interface IcdCode {
	id?: number;
	code: string;
	name: string;
	description: string;
}

export interface Permission {
	id?: number;
	key: string;
	name: string;
}

export type RolePermission = {
	id: number;
	role_id: number;
	permission_id: number;
	is_active: boolean;
};

export interface Selection {
	icd_codes?: IcdCode[];
	cpt_codes?: CptCode[];
	permissions?: Permission[];
}
