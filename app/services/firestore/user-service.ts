import useAuth from "@/app/hooks/useAuth";
import firestore from "@/app/lib/firestore";
import { firestoreTypeCovert } from "@/app/lib/firestore-type-convert";
import type { ConversationMessageModel, ConversationModel } from "@/app/models/firestore/conversation_model";
import type { UserModel } from "@/app/models/firestore/user_model";
import type { DocumentData, DocumentReference, Query, QueryDocumentSnapshot } from "firebase/firestore";
import { getUsersQuery } from "./queries/user-queries";

export const getUsers = async ({
	userId,
	limit = 10,
	nextAfter,
}: { userId?: string[]; limit?: number; nextAfter?: QueryDocumentSnapshot }) => {
	const query = getUsersQuery(
		{ ...(userId && { userId }) },
		{
			...(nextAfter && { nextAfter }),
			...(limit && { limit }),
		},
	);

	const users = await firestore.lib.getDocs(query);

	return {
		data: users.docs.map((user) => ({ ...user.data(), id: user.id })),
		nextAfter: users.docs[users.docs.length - 1],
	};
};
