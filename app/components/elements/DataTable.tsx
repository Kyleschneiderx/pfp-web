"use client";

import type { OptionsModel } from "@/app/models/common_model";
import clsx from "clsx";
import Input from "./Input";
import SelectCmp from "./SelectCmp";
import Pagination from "./Pagination";

export interface Column<T> {
	header: string;
	accessor: keyof T | ((row: T) => React.ReactNode);
	className?: string;
}

export type SortDirection = "asc" | "desc";

export interface TableFilterOption {
	label: string;
	value: string;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	getRowKey: (row: T, index: number) => string | number;
	emptyValue?: string;
	emptyMessage?: string;
	className?: string;
	size?: "sm" | "md";
	searchPlaceholder?: string;
	searchValue?: string;
	onSearch?: (term: string) => void;
	filterOptions?: TableFilterOption[];
	filterValue?: string;
	onFilter?: (value: string) => void;
	sortFieldOptions?: TableFilterOption[];
	sortField?: string;
	sortDirection?: SortDirection;
	onSort?: (field: string, direction: SortDirection) => void;
	page?: number;
	maxPage: number;
	onPageChange?: (page: number) => void;
}

const cellPadding = {
	sm: "py-2 px-3",
	md: "py-3 px-2 sm:px-4",
};

const SORT_DIRECTION_OPTIONS: TableFilterOption[] = [
	{ label: "Ascending", value: "asc" },
	{ label: "Descending", value: "desc" },
];

export default function DataTable<T extends object>({
	columns,
	data,
	getRowKey,
	emptyValue = "—",
	emptyMessage,
	className,
	size = "sm",
	searchPlaceholder,
	searchValue = "",
	onSearch,
	filterOptions,
	filterValue,
	onFilter,
	sortFieldOptions,
	sortField,
	sortDirection = "asc",
	onSort,
	page = 1,
	maxPage,
	onPageChange,
}: DataTableProps<T>) {
	const padding = cellPadding[size];
	const showFilterBar =
		onSearch !== undefined ||
		(onFilter !== undefined && filterOptions?.length) ||
		(onSort !== undefined && sortFieldOptions?.length);

	const getCellValue = (row: T, column: Column<T>): React.ReactNode => {
		if (typeof column.accessor === "function") {
			return column.accessor(row);
		}
		const value = (row as Record<string, unknown>)[column.accessor as string];
		if (value === undefined || value === null || value === "") {
			return emptyValue;
		}
		if (typeof value === "boolean") {
			return value ? "Yes" : emptyValue;
		}
		return String(value);
	};

	return (
		<div className={clsx("overflow-x-auto text-sm", className)}>
			{showFilterBar && (
				<div className="py-4">
					<div className="flex flex-wrap items-center gap-3">
						{onSearch !== undefined && (
							<div className="w-full sm:w-96">
								<Input
									id="table-search"
									type="text"
									name="search"
									placeholder={searchPlaceholder ?? "Search..."}
									icon="Search"
									value={searchValue}
									onChange={(e) => onSearch(e.target.value)}
								/>
							</div>
						)}
						{onFilter !== undefined && filterOptions && filterOptions.length > 0 && (
							<div className="w-full sm:w-40">
								<SelectCmp
									options={filterOptions}
									value={filterOptions.find((o) => o.value === (filterValue ?? "")) ?? null}
									onChange={(e) => onFilter((e as OptionsModel)?.value ?? "")}
									placeholder="Filter by"
									aria-label="Filter by column"
								/>
							</div>
						)}
						{onSort !== undefined && sortFieldOptions && sortFieldOptions.length > 0 && (
							<>
								<div className="w-full sm:w-40">
									<SelectCmp
										options={sortFieldOptions}
										value={sortFieldOptions.find((o) => o.value === (sortField ?? "")) ?? null}
										onChange={(e) =>
											onSort((e as OptionsModel)?.value ?? sortFieldOptions[0]?.value ?? "", sortDirection)
										}
										placeholder="Sort by"
										aria-label="Sort by field"
									/>
								</div>
								<div className="w-full sm:w-36">
									<SelectCmp
										options={SORT_DIRECTION_OPTIONS}
										value={SORT_DIRECTION_OPTIONS.find((o) => o.value === sortDirection) ?? null}
										onChange={(e) =>
											onSort(sortField ?? sortFieldOptions[0]?.value ?? "", (e as OptionsModel)?.value as SortDirection)
										}
										placeholder="Direction"
										aria-label="Sort direction"
									/>
								</div>
							</>
						)}
					</div>
				</div>
			)}
			<div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
				<table className="w-full">
					<thead>
						<tr className="border-b border-neutral-200">
							{columns.map((col) => (
								<th
									key={col.header}
									className={clsx("text-left font-semibold text-neutral-600 uppercase text-xs", padding, col.className)}
								>
									{col.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.length === 0 && emptyMessage ? (
							<tr>
								<td colSpan={columns.length} className={clsx(padding, "text-center text-neutral-500")}>
									{emptyMessage}
								</td>
							</tr>
						) : (
							data.map((row, index) => (
								<tr key={getRowKey(row, index)} className="border-b border-neutral-100 last:border-0">
									{columns.map((col) => (
										<td key={col.header} className={clsx(padding, col.className)}>
											{getCellValue(row, col)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
				<div className="p-4 border-t border-neutral-200">
					<Pagination page={page ?? 1} maxPage={maxPage ?? 1} onPageChange={onPageChange ?? (() => {})} />
				</div>
			</div>
		</div>
	);
}
