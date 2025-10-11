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

export interface Selection {
	icd_codes?: IcdCode[];
	cpt_codes?: CptCode[];
}
