import type { ConversationMessageModel, ConversationModel } from "@/app/models/chat_model";
import type { EducationResponse, EducationCategoryModel } from "@/app/models/education_model";
import { apiClient } from "@/app/services/apiClient";

interface FormEducationParams {
	method: "POST" | "PUT";
	id?: number | null;
	body: FormData;
}

export interface ChatPaginationModel {
	has_next_page: boolean;
	next_page_id: string;
	page_items: number;
}

interface EducationCategoriesResponse {
	data: {
		education_category: EducationCategoryModel[];
	};
}

export const saveEducation = async ({ method, id, body }: FormEducationParams): Promise<ConversationModel> => {
	const url = `/educations/${id ?? ""}`;

	return apiClient<ConversationModel>({
		url: url,
		method: method,
		body: body,
	});
};

export const createGroup = async (body: { name: string }): Promise<ConversationModel> => {
	const url = "/chats/groups";

	return apiClient<ConversationModel>({
		url: url,
		method: "POST",
		body: body,
	});
};

export const deleteGroup = async (id: string): Promise<void> => {
	const url = `/chats/groups/${id}`;
	await apiClient({ url: url, method: "DELETE" });
};

export const deleteGroupMessage = async (groupId: string, id: string): Promise<void> => {
	const url = `/chats/groups/${groupId}/messages/${id}`;
	await apiClient({ url: url, method: "DELETE" });
};

export const kickGroupParticipant = async (groupId: string, id: string): Promise<void> => {
	const url = `/chats/groups/${groupId}/participants/${id}`;
	await apiClient({ url: url, method: "DELETE" });
};

export const getProviderConversations = async (
	params: Record<string, any>,
): Promise<{ data: ConversationModel[] } & ChatPaginationModel> => {
	const url = "/chats/providers";
	const data = await apiClient({
		url: url,
		method: "GET",
		params: params,
	});
	return data as { data: ConversationModel[] } & ChatPaginationModel;
};

export const getProviderConversationMessages = async (
	params: Record<string, any>,
): Promise<{ data: ConversationMessageModel[] } & ChatPaginationModel> => {
	const { id, ...rest } = params;
	const url = `/chats/providers/${params.id}/messages`;
	const data = await apiClient({
		url: url,
		method: "GET",
		params: rest,
	});
	return data as { data: ConversationMessageModel[] } & ChatPaginationModel;
};

export const getGroupConversations = async (
	params: Record<string, any>,
): Promise<{ data: ConversationModel[] } & ChatPaginationModel> => {
	const url = "/chats/groups";
	const data = await apiClient({
		url: url,
		method: "GET",
		params: params,
	});
	return data as { data: ConversationModel[] } & ChatPaginationModel;
};

export const getGroupConversationMessages = async (
	params: Record<string, any>,
): Promise<{ data: ConversationMessageModel[] } & ChatPaginationModel> => {
	const { id, ...rest } = params;
	const url = `/chats/groups/${params.id}/messages`;
	const data = await apiClient({
		url: url,
		method: "GET",
		params: rest,
	});
	return data as { data: ConversationMessageModel[] } & ChatPaginationModel;
};
