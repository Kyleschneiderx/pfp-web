import useAuth from "@/app/hooks/useAuth";
import firestore from "@/app/lib/firestore";
import { firestoreTypeCovert } from "@/app/lib/firestore-type-convert";
import type { ConversationMessageModel, ConversationModel } from "@/app/models/firestore/conversation_model";
import type { UserModel } from "@/app/models/firestore/user_model";
import type { DocumentReference, QueryDocumentSnapshot } from "firebase/firestore";
import { getConversationMessagesQuery, getConversationsQuery } from "./queries/conversation-queries";
import type { BaseQueryOptions } from "./type";

export const getConversations = async ({ nextAfter, limit = 10, where, orderBy }: BaseQueryOptions) => {
	const query = getConversationsQuery({
		...(where && { where }),
		...(orderBy && { orderBy }),
		...(nextAfter && { nextAfter }),
		...(limit && { limit: limit + 1 }),
	});

	const rooms = await firestore.lib.getDocs(query);

	const slicedRooms = rooms.docs.slice(0, limit);

	return {
		data: slicedRooms.map((room) => ({ ...room.data(), id: room.id })),
		hasNext: rooms.docs.length > limit,
		nextAfter: slicedRooms[slicedRooms.length - 1],
		initialDocs: rooms.docs[0],
	};
};

export const getConversationMessages = async (
	conversationId: string,
	{ nextAfter, limit = 10, where, orderBy }: BaseQueryOptions,
) => {
	const query = getConversationMessagesQuery(conversationId, {
		...(where && { where }),
		...(orderBy && { orderBy }),
		...(nextAfter && { nextAfter }),
		...(limit && { limit: limit + 1 }),
	});

	const messages = await firestore.lib.getDocs(query);

	const slicedMessages = messages.docs.slice(0, limit);

	return {
		data: slicedMessages.map((message) => ({ ...message.data(), id: message.id })),
		hasNext: messages.docs.length > limit,
		nextAfter: slicedMessages[slicedMessages.length - 1],
		initialDocs: messages.docs[0],
	};
};

export const createGroupConversation = async (name: string) => {
	const { user } = useAuth();

	const timestamp = Date.now();

	const message = `“${name}” is live! Use this chat to get support, ask questions, or keep everyone updated`;

	const conversation = await firestore.lib.addDoc(
		firestore.lib.collection(firestore.db, "rooms").withConverter(firestoreTypeCovert<ConversationModel>()),
		{
			collection: "rooms",
			parentCollection: null,
			name: name,
			participants: [String(user?.id)],
			isGroup: true,
			createdAt: timestamp,
			updatedAt: timestamp,
			lastMessage: {
				message: message,
				name: "System",
			},
		},
	);

	firestore.lib.addDoc(
		firestore.lib
			.collection(firestore.db, "rooms", conversation.id, "messages")
			.withConverter(firestoreTypeCovert<ConversationMessageModel>()),
		{
			collection: "messages",
			parentCollection: "rooms",
			senderId: null,
			name: "System",
			avatar: null,
			message: message,
			createdAt: timestamp,
			updatedAt: timestamp,
			files: [],
		},
	);

	return {
		data: conversation,
	};
};

export const deleteConversation = async (conversationId: string) => {
	try {
		await firestore.lib.deleteDoc(firestore.lib.doc(firestore.db, "rooms", conversationId));
	} catch (err) {
		console.error("Failed to delete conversation");
	}
};

export const postConversationMessage = async (message: string, conversationId: string) => {
	const { user } = useAuth();

	try {
		const conversation = await firestore.lib.getDocs(
			getConversationsQuery({ where: [["__name__", "in", [conversationId]]] }),
		);

		const conversationData = conversation.docs[0].data();

		const timestamp = Date.now();

		const [post, _] = await Promise.all([
			firestore.lib.addDoc(
				firestore.lib
					.collection(firestore.db, "rooms", conversationId, "messages")
					.withConverter(firestoreTypeCovert<ConversationMessageModel>()),
				{
					collection: "messages",
					parentCollection: "rooms",
					senderId: String(user?.id),
					name: user?.user_profile.name,
					avatar: user?.user_profile.photo,
					message: message,
					createdAt: timestamp,
					updatedAt: timestamp,
					files: [],
				},
			),
			firestore.lib.updateDoc(firestore.lib.doc(firestore.db, "rooms", conversationId), {
				lastMessage: {
					senderId: String(user?.id),
					name: user?.user_profile.name,
					avatar: user?.user_profile.photo,
					message: message,
				},
				...(!conversationData.participants.includes(String(user?.id)) &&
					conversationData.isGroup && { participants: firestore.lib.arrayUnion(String(user?.id)) }),
				updatedAt: timestamp,
			}),
		]);

		return post;
	} catch (err) {
		console.error(err);
	}
};

export const deleteConversationMessage = async (conversationId: string, messageId: string) => {
	try {
		const message = await firestore.lib.getDocs(
			getConversationMessagesQuery(conversationId, {
				orderBy: [["updatedAt", "desc"]],
				limit: 1,
			}),
		);

		if (message.docs?.[0] && message.docs?.[0]?.id === messageId) {
			await firestore.lib.updateDoc(firestore.lib.doc(firestore.db, "rooms", conversationId), {
				"lastMessage.message": "Deleted message",
			});
		}

		await firestore.lib.deleteDoc(firestore.lib.doc(firestore.db, "rooms", conversationId, "messages", messageId));
	} catch (err) {
		console.error("Failed to delete conversation message");
	}
};

export const removeParticipant = async (conversationId: string, participantId: string) => {
	try {
		await firestore.lib.updateDoc(firestore.lib.doc(firestore.db, "rooms", conversationId), {
			participants: firestore.lib.arrayRemove(participantId),
		});
	} catch (err) {
		console.error("Failed to remove participant");
	}
};
