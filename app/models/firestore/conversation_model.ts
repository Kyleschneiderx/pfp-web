export interface ConversationLastMessageModel {
	senderId?: string;
	message: string;
	name: string | null;
}

export interface ConversationModel {
	id?: string;
	name: string;
	isGroup: boolean;
	createdAt: number;
	updatedAt: number;
	participants: string[];
	lastMessage: ConversationLastMessageModel;
}

export interface ConversationMessageFilesModel {
	name: string;
	url: string;
}

export interface ConversationMessageModel {
	id?: string;
	name?: string | null;
	senderId?: string | null;
	files: ConversationMessageFilesModel[];
	avatar?: string | null;
	message: string;
	createdAt: number;
	updatedAt: number;
}
