"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDateToLocal } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import type { CustomForm } from "@/app/models/custom_form_model";
import { deleteCustomForm } from "@/app/services/client_side/custom-forms";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useModal } from "@/app/contexts/ModalContext";
import Button from "../elements/Button";
import DataTable, { type Column } from "../elements/DataTable";
import Loader from "../elements/Loader";
import Pagination from "../elements/Pagination";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import IconAddButton from "../elements/mobile/IconAddButton";
import Link from "next/link";
import { EllipsisIcon } from "lucide-react";

const SORT_FIELD_OPTIONS = [
	{ label: "Created at", value: "created_at" },
	{ label: "Identifier", value: "identifier" },
	{ label: "Name", value: "name" },
];

const FILTER_COLUMN_OPTIONS = [
	{ label: "All columns", value: "all" },
	{ label: "Identifier", value: "identifier" },
	{ label: "Name", value: "name" },
];

function parseSort(sort: string): { field: string; direction: "asc" | "desc" } {
	const [field, dir] = sort.split(":");
	return {
		field: field || "created_at",
		direction: dir === "asc" || dir === "desc" ? dir : "desc",
	};
}

export default function FormBuilderList({
	initialList,
	initialPage,
	maxPage,
	sort,
	search,
	filterColumn,
}: {
	initialList: CustomForm[];
	initialPage: number;
	maxPage: number;
	sort: string;
	search: string;
	filterColumn: string;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const modal = useModal();
	const { showSnackBar } = useSnackBar();

	const [forms, setForms] = useState(initialList);
	const [page, setPage] = useState(initialPage);
	const [searchInput, setSearchInput] = useState(search);
	const [isPending, startTransition] = useTransition();

	const updateParams = useCallback(
		(updates: Record<string, string>) => {
			const params = new URLSearchParams(searchParams.toString());
			for (const [key, value] of Object.entries(updates)) {
				if (value) {
					params.set(key, value);
				} else {
					params.delete(key);
				}
			}
			params.delete("page");
			router.replace(`${pathname}?${params.toString()}`);
		},
		[pathname, router, searchParams],
	);

	const handleSearch = useDebouncedCallback((term: string) => {
		updateParams({ search: term });
	}, 300);

	const handleSort = (field: string, direction: "asc" | "desc") => {
		updateParams({ sort: `${field}:${direction}` });
	};

	const handleFilterColumnChange = (value: string) => {
		updateParams({ filter_column: value });
	};

	const handlePageChange = (newPage: number) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams.toString());
			params.set("page", String(newPage));
			router.replace(`${pathname}?${params.toString()}`);
		});
	};

	useEffect(() => {
		setForms(initialList);
		setPage(initialPage);
	}, [initialList, initialPage]);

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	const { field: sortField, direction: sortDirection } = useMemo(() => parseSort(sort), [sort]);

	const filteredForms = useMemo(() => {
		const term = search.trim().toLowerCase();
		if (!term) return forms;
		return forms.filter((row) => {
			const identifier = (row.identifier ?? "").toLowerCase();
			const name = (row.name ?? "").toLowerCase();
			if (filterColumn === "identifier") return identifier.includes(term);
			if (filterColumn === "name") return name.includes(term);
			return identifier.includes(term) || name.includes(term);
		});
	}, [forms, search, filterColumn]);

	const handleDelete = (form: CustomForm) => {
		modal.open({
			type: "confirm",
			title: "Delete Form",
			message: "Are you sure you want to remove this form?",
			onConfirm: async () => {
				try {
					await deleteCustomForm(form.id);
					await revalidatePage("/settings/form-builder");
					modal.closeAll();
					showSnackBar({ message: "Form removed.", success: true });
				} catch (e) {
					const error = e as ErrorModel;
					showSnackBar({ message: error?.msg ?? "Delete failed", success: false });
				}
			},
		});
	};

	const columns: Column<CustomForm>[] = [
		{
			header: "Name",
			accessor: (row) => (
				<Link href={`/settings/form-builder/${row.id}/edit`} className="text-primary-500 truncate block">
					{row.name ?? "—"}
				</Link>
			),
			className: "w-1/2 max-w-1/2",
		},
		{
			header: "Questions",
			accessor: (row) => row.schema?.fields?.length ?? 0,
		},
		{
			header: "Last Updated",
			accessor: (row) => formatDateToLocal(row.updated_at),
		},
		{
			header: "",
			accessor: (row) => (
				<ResponsiveActionMenu
					icon={
						<EllipsisIcon
							size={24}
							className="border border-primary-500 bg-primary-500 rounded-full p-1 text-white font-bold hover:bg-primary-600"
						/>
					}
					title={row.name ?? row.identifier}
					className="cursor-pointer"
					onEdit={() => router.push(`/settings/form-builder/${row.id}/edit`)}
					onDelete={() => handleDelete(row)}
				/>
			),
			className: "w-12",
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div className="flex flex-col gap-2">
					<span className="text-lg font-semibold text-neutral-900">Forms</span>
					<p className="text-sm text-neutral-500 max-w-[700px]">
						Create customizable questions with various input types, enabling structured and flexible data capture across
						different use cases.
					</p>
				</div>
				<Link href="/settings/form-builder/create" className="w-full sm:w-auto">
					<Button label="Add Form" showIcon className="w-full sm:w-auto" />
					{/* <IconAddButton className="sm:hidden" /> */}
				</Link>
			</div>

			<div className="">
				{isPending ? (
					<div className="flex justify-center py-16">
						<Loader />
					</div>
				) : (
					<>
						<DataTable
							columns={columns}
							data={filteredForms}
							getRowKey={(row) => row.id}
							size="md"
							emptyMessage={
								!forms.length ? "No forms found" : !filteredForms.length ? "No forms match your search" : undefined
							}
							searchPlaceholder="Search forms..."
							searchValue={searchInput}
							onSearch={(v) => {
								setSearchInput(v);
								handleSearch(v);
							}}
							page={page}
							maxPage={maxPage}
							onPageChange={handlePageChange}
							// filterOptions={FILTER_COLUMN_OPTIONS}
							// filterValue={filterColumn}
							// onFilter={handleFilterColumnChange}
							// sortFieldOptions={SORT_FIELD_OPTIONS}
							// sortField={sortField}
							// sortDirection={sortDirection}
							// onSort={handleSort}
						/>
					</>
				)}
			</div>
		</div>
	);
}
