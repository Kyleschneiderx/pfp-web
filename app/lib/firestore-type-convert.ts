export const firestoreTypeCovert = <T>() => ({
	toFirestore: (data: T) => {
		return data;
	},
	fromFirestore: (snap: any) => {
		return snap.data() as T;
	},
});
