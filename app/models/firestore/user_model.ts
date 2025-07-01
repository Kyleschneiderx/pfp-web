export interface UserModel {
	id?: string;
	name: string;
	email: string;
	avatar?: string | null;
	online?: boolean;
	isAdmin?: boolean;
}
