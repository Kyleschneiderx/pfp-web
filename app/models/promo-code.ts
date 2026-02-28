import type { PatientModel } from "./patient_model";

export type PromoCode = {
	id: number;
	code: string;
	times_to_claim: number;
	voucher_to_generate: number;
	percent_off: number;
	expires_at: string | Date;
	is_user_upgradable?: boolean;
	created_at: string | Date;
	updated_at: string | Date;
};

export type PromoCodeFormSchema = Partial<Omit<PromoCode, "created_at" | "updated_at">>;
