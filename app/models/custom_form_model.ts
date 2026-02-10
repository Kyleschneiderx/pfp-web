export type CustomFormFieldType = "Input" | "Textarea" | "Checkbox" | "Radio" | "Select";

export interface CustomFormFieldOption {
	value: string;
	label: string;
}

export interface CustomFormField {
	id: string;
	type: CustomFormFieldType;
	label: string;
	required?: boolean;
	options?: CustomFormFieldOption[];
}

export interface CustomFormSchema {
	fields: CustomFormField[];
}

export interface CustomForm {
	id: number;
	identifier: string;
	version: number;
	name: string | null;
	schema: CustomFormSchema;
	created_at: string;
	updated_at: string;
}

export interface CustomFormCreateBody {
	name?: string | null;
	schema: CustomFormSchema;
}

export interface CustomFormUpdateBody {
	name?: string | null;
	schema?: CustomFormSchema;
}
