import firestore from "@/app/lib/firestore";
import { firestoreTypeCovert } from "@/app/lib/firestore-type-convert";
import type { ConversationMessageModel, ConversationModel } from "@/app/models/firestore/conversation_model";
import type { UserModel } from "@/app/models/firestore/user_model";
import type { QueryDocumentSnapshot } from "firebase/firestore";

export const getUsersQuery = (
	filter?: { userId?: string[] },
	options?: { nextAfter?: QueryDocumentSnapshot; limit?: number },
) => {
	return firestore.lib.query(
		firestore.lib.collection(firestore.db, "users").withConverter(firestoreTypeCovert<UserModel>()),
		...(filter?.userId && filter.userId.length > 0
			? [firestore.lib.where(firestore.lib.documentId(), "in", filter.userId)]
			: []),
		...(options?.nextAfter ? [firestore.lib.startAfter(options.nextAfter)] : []),
		...(options?.limit && options.limit > 0 ? [firestore.lib.limit(options.limit)] : []),
	);
};
