import type { OrderByDirection, QueryDocumentSnapshot, WhereFilterOp } from "firebase/firestore";

export interface BaseQueryOptions {
	limit?: number;
	nextAfter?: QueryDocumentSnapshot;
	where?: [string, WhereFilterOp, unknown][];
	orderBy?: [string, OrderByDirection][];
}
