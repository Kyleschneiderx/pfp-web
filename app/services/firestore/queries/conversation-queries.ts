import firestore from "@/app/lib/firestore";
import { firestoreTypeCovert } from "@/app/lib/firestore-type-convert";
import type { ConversationMessageModel, ConversationModel } from "@/app/models/firestore/conversation_model";
import type { BaseQueryOptions } from "../type";

export const getConversationsQuery = ({ where, orderBy, nextAfter, limit }: BaseQueryOptions) => {
	return firestore.lib.query(
		firestore.lib.collection(firestore.db, "rooms").withConverter(firestoreTypeCovert<ConversationModel>()),
		...(orderBy ? orderBy.map((o) => firestore.lib.orderBy(o[0], o[1])) : []),
		...(nextAfter ? [firestore.lib.startAfter(nextAfter)] : []),
		...(where ? where.map((w) => firestore.lib.where(w[0], w[1], w[2])) : []),
		...(limit && limit > 0 ? [firestore.lib.limit(limit)] : []),
	);
};

export const getConversationMessagesQuery = (
	conversationId: string,
	{ where, orderBy, nextAfter, limit }: BaseQueryOptions,
) => {
	return firestore.lib.query(
		firestore.lib
			.collection(firestore.db, "rooms", conversationId, "messages")
			.withConverter(firestoreTypeCovert<ConversationMessageModel>()),
		...(orderBy ? orderBy.map((o) => firestore.lib.orderBy(o[0], o[1])) : []),
		...(nextAfter ? [firestore.lib.startAfter(nextAfter)] : []),
		...(where ? where.map((w) => firestore.lib.where(w[0], w[1], w[2])) : []),
		...(limit && limit > 0 ? [firestore.lib.limit(limit)] : []),
	);
};
