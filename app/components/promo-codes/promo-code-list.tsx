"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDateToLocal } from "@/app/lib/utils";
import type { ErrorModel } from "@/app/models/error_model";
import type { PromoCode } from "@/app/models/promo-code";
import type { PromoCodeStatsModel } from "@/app/models/promo_code_stats_model";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
	Copy,
	EllipsisIcon,
	Ticket,
	Users,
	HandCoins,
	Gift,
	Gauge,
	Zap,
	type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useModal } from "@/app/contexts/ModalContext";
import Button from "../elements/Button";
import Card from "../elements/Card";
import DataTable, { type Column } from "../elements/DataTable";
import InfoPopover from "../elements/InfoPopover";
import Loader from "../elements/Loader";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import IconAddButton from "../elements/mobile/IconAddButton";
import { deletePromoCode } from "@/app/services/client_side/promo-codes";
import { getPromoCodeStats } from "@/app/services/client_side/stats";

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
	const [promoStats, setPromoStats] = useState<PromoCodeStatsModel | null>(null);
	const [statsLoading, setStatsLoading] = useState(true);

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

	useEffect(() => {
		let cancelled = false;
		setStatsLoading(true);
		getPromoCodeStats()
			.then((stats) => {
				if (!cancelled) setPromoStats(stats);
			})
			.finally(() => {
				if (!cancelled) setStatsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

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
			header: "Times claimed",
			accessor: (row) => row.total_claimed ?? 0,
		},
		{
			header: "Times to claim",
			accessor: (row) => row.times_to_claim ?? 0,
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

	const statCards: {
		label: string;
		value: number;
		icon: LucideIcon;
		infoContent?: React.ReactNode;
	}[] = [
		{ label: "Total promo codes", value: promoStats?.total_promo_codes ?? 0, icon: Ticket },
    { label: "Active codes", value: promoStats?.active_promo_codes ?? 0, icon: Zap },
		{ label: "Unique users claimed", value: promoStats?.unique_users_claimed ?? 0, icon: Users },
		{ label: "Total claims", value: promoStats?.total_claims ?? 0, icon: HandCoins },
		{ label: "Vouchers generated", value: promoStats?.total_vouchers_generated ?? 0, icon: Gift },
		// {
		// 	label: "Promo codes at limit",
		// 	value: promoStats?.promo_codes_at_capacity ?? 0,
		// 	icon: Gauge,
		// 	infoContent: (
		// 		<div className="text-sm text-neutral-700 max-w-xs flex flex-col space-y-1">
		// 			<span className="font-semibold">Promo codes at limit</span>
		// 			<p className="text-xs">
		// 				Number of promo codes that have reached their claim limit (times claimed ≥ times to claim). These
		// 				codes can no longer be claimed until the limit is increased.
		// 			</p>
		// 		</div>
		// 	),
		// },

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

			{statsLoading ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
					{statCards.map((_, i) => (
						<Card key={i} className="animate-pulse">
							<div className="h-8 bg-neutral-200 rounded w-12" />
							<div className="h-4 bg-neutral-100 rounded w-24 mt-2" />
						</Card>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
					{statCards.map((card) => {
						const Icon = card.icon;
						return (
							<Card key={card.label}>
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0">
										<p className="text-2xl font-bold text-neutral-900">{card.value}</p>
										<div className="flex items-center gap-1 mt-0.5">
											<p className="text-sm text-neutral-600">{card.label}</p>
											{card.infoContent ? (
												<InfoPopover side="top" align="start">
													{card.infoContent}
												</InfoPopover>
											) : null}
										</div>
									</div>
									<Icon className="size-8 shrink-0 text-primary-500" aria-hidden />
								</div>
							</Card>
						);
					})}
				</div>
			)}

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
