export type PracticeLicense = {
	license: string;
	state: string;
};

export type Practice = {
	id: number;
	name: string;
	slug: string;
	bio: string;
	npi: string;
	license: PracticeLicense[];
	photo: string;
	created_at: string;
	updated_at: string;
};

export type PracticeFormSchema = {
	id?: number;
	name: string;
	slug: string;
	bio: string;
	npi: string;
	license: PracticeLicense[];
	photo?: File | string;
};
