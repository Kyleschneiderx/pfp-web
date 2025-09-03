export interface ConversationLastMessageModel {
	senderId?: string;
	message: string;
}

export interface ConversationParticipantModel {
	name: string | null;
	avatar?: string | null;
	isAdmin: boolean;
}

export interface ConversationModel {
	id?: string;
	name: string;
	isGroup: boolean;
	createdAt: number;
	updatedAt: number;
	participants: Record<string, ConversationParticipantModel>;
	lastMessage: ConversationLastMessageModel;
	collection: string | null;
	parentCollection: string | null;
}

export interface ConversationMessageFilesModel {
	name: string;
	url: string;
}

export interface ConversationMessageModel {
	id?: string;
	senderId?: string | null;
	files: ConversationMessageFilesModel[];
	message: string;
	createdAt: number;
	updatedAt: number;
	collection: string | null;
	parentCollection: string | null;
}
