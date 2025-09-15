export interface SelectOptionsModel {
	label: string;
	value: string;
}

export interface PaginationModel {
	page: number;
	page_items: number;
	max_page: number;
}

export interface InfinitePaginationModel {
	has_next_page: boolean;
	next_page_id: string;
	page_items: number;
}

export type List<T, P = PaginationModel> = {
	data: T[];
} & P;

export type DefaultSearchQuery =
	| {
			page?: string;
			page_items?: string;
			next_page_id?: string;
	  }
	| Record<string, string>;
