"use client";

import type { OptionsModel } from "@/app/models/common_model";
import clsx from "clsx";
import Input from "./Input";
import SelectCmp from "./SelectCmp";
import Pagination from "./Pagination";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { useState } from "react";

type ColumnSort =
	| {
			sortField: string;
			sortDirection?: SortDirection;
			onSort?: (field: string, direction: SortDirection) => void;
			currentSortField?: string;
	  }
	| { sortField?: never; sortDirection?: never; onSort?: never; currentSortField?: never };

export type Column<T> = {
	header: string;
	accessor: keyof T | ((row: T) => React.ReactNode);
	className?: string;
} & ColumnSort;

export type SortDirection = "asc" | "desc" | undefined | string;

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

	filters?: Record<
		string,
		{
			options: { label: string; value: string }[];
			selectedValue?: string;
			placeholder?: string;
			className?: string;
			onChange: (value: string) => void;
		}
	>;
	page?: number;
	maxPage?: number;
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
	filters,
	page = 1,
	maxPage = 1,
	onPageChange,
}: DataTableProps<T>) {
	const padding = cellPadding[size];
	const showFilterBar = onSearch !== undefined || (filters && Object.keys(filters).length > 0);

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
					<div className="flex flex-wrap items-center gap-3 w-full">
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
						{filters && (
							<div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
								{Object.entries(filters).map(([key, filter]) => (
									<div key={key} className={clsx("w-full", filter.className)}>
										<SelectCmp
											className="!py-[1px]"
											options={filter.options}
											value={filter.selectedValue ? filter.options.find((o) => o.value === filter.selectedValue) : null}
											onChange={(e) => filter.onChange((e as OptionsModel)?.value ?? "")}
											placeholder={filter.placeholder}
										/>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
			<div className="bg-white rounded-lg border border-neutral-200">
				<div className="overflow-x-auto">
					<table className="w-full overflow-x-auto">
						<thead>
							<tr className="border-b border-neutral-200">
								{columns.map((col) => (
									<th
										key={col.header}
										className={clsx(
											"text-left font-semibold text-neutral-600 uppercase text-xs",
											padding,
											col.className,
										)}
									>
										<div className="flex items-center">
											{col.header}
											{col?.onSort && (
												<button
													type="button"
													onClick={() => {
														col?.onSort?.(
															col?.sortField,
															col?.sortDirection === "asc" && col?.currentSortField === col?.sortField
																? "desc"
																: col?.sortDirection === "desc" && col?.currentSortField === col?.sortField
																	? undefined
																	: "asc",
														);
													}}
												>
													{col?.currentSortField === col?.sortField && col?.sortDirection === "asc" ? (
														<ArrowUpIcon size={16} className="ml-1 text-primary-500" />
													) : col?.currentSortField === col?.sortField && col?.sortDirection === "desc" ? (
														<ArrowDownIcon size={16} className="ml-1 text-primary-500" />
													) : (
														<ArrowUpDownIcon size={16} className="ml-1" />
													)}
												</button>
											)}
										</div>
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
				</div>
				<div className="p-4 border-t border-neutral-200">
					<Pagination page={page ?? 1} maxPage={maxPage ?? 1} onPageChange={onPageChange ?? (() => {})} />
				</div>
			</div>
		</div>
	);
}
