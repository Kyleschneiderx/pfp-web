"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDateToLocal } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import type { PromoCode } from "@/app/models/promo-code";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Copy, EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useModal } from "@/app/contexts/ModalContext";
import Button from "../elements/Button";
import DataTable, { type Column } from "../elements/DataTable";
import Loader from "../elements/Loader";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import IconAddButton from "../elements/mobile/IconAddButton";
import { deletePromoCode } from "@/app/services/client_side/promo-codes";

export default function PromoCodeList({
	initialList,
	initialPage,
	maxPage,
	search,
	sort,
}: {
	initialList: PromoCode[];
	initialPage: number;
	maxPage: number;
	search: string;
	sort: string;
}) {
	const modal = useModal();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentSort = searchParams.get("sort")?.split(":") ?? undefined;
	const { showSnackBar } = useSnackBar();

	const [data, setData] = useState(initialList);
	const [page, setPage] = useState(initialPage);
	const [isPending, startTransition] = useTransition();
	const [searchInput, setSearchInput] = useState(search);

	const updateParams = useCallback(
		(updates: Record<string, string | undefined>) => {
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

	const handleSortChange = (value: string | undefined) => {
		updateParams({ sort: value });
	};

	const handlePageChange = (newPage: number) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams.toString());
			params.set("page", String(newPage));
			router.replace(`${pathname}?${params.toString()}`);
		});
	};

	useEffect(() => {
		setData(initialList);
		setPage(initialPage);
	}, [initialList, initialPage]);

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	const handleCopyCode = async (code: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(code);
			showSnackBar({ message: "Promo code copied to clipboard", success: true });
		} catch {
			showSnackBar({ message: "Failed to copy", success: false });
		}
	};

	const handleDelete = (row: PromoCode) => {
		modal.open({
			type: "confirm",
			title: "Delete Promo Code",
			message: "Are you sure you want to remove this promo code?",
			onConfirm: async () => {
				try {
					await deletePromoCode(row.id);
					await revalidatePage("/settings/promo-codes");
					modal.closeAll();
				} catch (e) {
					const error = e as ErrorModel;
					showSnackBar({ message: error.msg, success: false });
				}
			},
		});
	};

	const columns: Column<PromoCode>[] = [
		{
			header: "Code",
			accessor: (row) => (
				<div className="flex items-center gap-2">
					<Link href={`/settings/promo-codes/${row.id}/edit`} className="font-medium text-primary-500">
						{row.code}
					</Link>
					<button
						type="button"
						onClick={(e) => handleCopyCode(row.code, e)}
						className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700"
						aria-label={`Copy ${row.code}`}
					>
						<Copy size={16} />
					</button>
				</div>
			),
		},
		{
			header: "% Off",
			accessor: (row) => `${row.percent_off}%`,
		},
		{
			header: "Vouchers",
			accessor: (row) => `${row.voucher_to_generate ?? 0}`,
		},
		{
			header: "User Upgrade",
			accessor: (row) => (row.is_user_upgradable ? "Yes" : "No"),
		},
		{
			header: "Expires",
			accessor: (row) => (row.expires_at ? formatDateToLocal(row.expires_at) : "N/A"),
		},
		{
			header: "Date Created",
			onSort: (field, direction) => handleSortChange(direction ? `${field}:${direction}` : undefined),
			currentSortField: currentSort?.[0],
			sortDirection: currentSort?.[0] === "id" ? currentSort?.[1] : undefined,
			sortField: "id",
			accessor: (row) => (row.created_at ? formatDateToLocal(row.created_at) : "—"),
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
					title={row.code}
					className="cursor-pointer"
					onEdit={() => router.push(`/settings/promo-codes/${row.id}/edit`)}
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
					<span className="text-lg font-semibold text-neutral-900">Promo Codes</span>
					<p className="text-sm text-neutral-500 max-w-[700px]">
						Manage promo codes for discounts and voucher generation.
					</p>
				</div>
				<Link href="/settings/promo-codes/create">
					<Button label="Add Promo Code" showIcon className="hidden sm:flex" />
					<IconAddButton className="sm:hidden" />
				</Link>
			</div>

			<div>
				{isPending ? (
					<div className="flex justify-center py-16">
						<Loader />
					</div>
				) : (
					<DataTable
						columns={columns}
						data={data}
						emptyMessage={!data.length ? "No promo codes found" : undefined}
						getRowKey={(row) => row.id}
						size="md"
						searchPlaceholder="Search promo codes..."
						searchValue={searchInput}
						onSearch={(v) => {
							setSearchInput(v);
							handleSearch(v);
						}}
						maxPage={maxPage}
						page={page}
						onPageChange={handlePageChange}
					/>
				)}
			</div>
		</div>
	);
}
