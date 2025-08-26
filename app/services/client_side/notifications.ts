import { apiClient } from "@/app/services/apiClient";

export const sendPushNotification = async (payload: { title: string; description: string }): Promise<{
	msg: string;
}> => {
	const url = "/notifications/push-notifications";

	return apiClient<{ msg: string }>({
		url: url,
		method: "POST",
		body: payload,
	});
};
