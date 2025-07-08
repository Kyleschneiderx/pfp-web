import { initializeApp } from "firebase/app";
import * as firestore from "firebase/firestore";
import { getAuth, signInWithCustomToken } from "firebase/auth";

const app = initializeApp(JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT as string));

const database = firestore.getFirestore(app, process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DB ?? "");

export default {
	db: database,
	auth: async (token: string) => {
		return await signInWithCustomToken(getAuth(app), token);
	},
	lib: firestore,
};
