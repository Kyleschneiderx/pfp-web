"use client";

import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Loader from "../elements/Loader";
import type { PaginationModel, List } from "@/app/models/global_model";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/contexts/ModalContext";
import { revalidatePage } from "@/app/lib/revalidate";
import type { ErrorModel } from "@/app/models/error_model";
import { formatDateToLocal } from "@/app/lib/utils";
import DataList from "../data-list";
import FilterList from "../elements/FilterList";
import Link from "next/link";
import Button from "../elements/Button";
import IconAddButton from "../elements/mobile/IconAddButton";
import type { PromoCode } from "@/app/models/promo-code";
import type { PromoCodeSearchQuery } from "@/app/services/server_side/promo-codes";
import { TicketIcon, TicketPercentIcon, TicketXIcon } from "lucide-react";
import { deletePromoCode } from "@/app/services/client_side/promo-codes";
import { getPromoCodeList } from "./actions";

export default function PromoCodeList({
	list,
	search,
}: {
	list?: List<PromoCode>;
	search?: PromoCodeSearchQuery;
}) {
	const router = useRouter();
	const modal = useModal();
	const [data, setData] = useState<PromoCode[]>();
	const [pagination, setPagination] = useState<PaginationModel>();
	const [ref, inView] = useInView();

	const { showSnackBar } = useSnackBar();

	useEffect(() => {
		if (!list) return;

		const { data: listData, ...metadata } = list;

		if (metadata.page === 1) {
			setData(listData);
		} else {
			setData((prev) => [...(prev ?? []), ...listData]);
		}

		setPagination(metadata);
	}, [list]);

	const loadMore = async () => {
		try {
			const response = await getPromoCodeList({
				page: `${Number(pagination?.page) + 1}`,
				page_items: `${pagination?.page_items}`,
			});

			if (!response) return;

			const { data: listData, ...metadata } = response;

			setData((prev) => [...(prev ?? []), ...listData]);

			setPagination(metadata);
		} catch (error) {
			const apiError = error as ErrorModel;
		}
	};

	useEffect(() => {
		if (inView && pagination && pagination.page < pagination.max_page) {
			loadMore();
		}
	}, [inView]);

	const handleDelete = async (data: PromoCode) => {
		modal.open({
			type: "confirm",
			title: "Delete Promo Code",
			message: "Are you sure you want to remove this promo code?",
			onConfirm: async () => {
				try {
					await deletePromoCode(data.id!);

					await revalidatePage("/settings/promo-codes");

					modal.closeAll();
				} catch (e) {
					const error = e as ErrorModel;

					showSnackBar({ message: error.msg, success: false });
				}
			},
		});
	};

	return (
		<DataList
			data={data}
			header={
				<div className="flex items-center mb-8">
					<FilterList
						searchPlaceholder="Search promo codes"
						searchParam="search"
						searchValue={search?.search}
						// onSearch={(string) => handleFilter("search", string)}
						// sort={{
						// 	label: "Sort",
						// 	content: () => {
						// 		return (
						// 			<div className="flex flex-col space-y-3 p-3 text-sm font-semibold">
						// 				<label className="flex items-center cursor-pointer">
						// 					<input
						// 						type="checkbox"
						// 						checked={filterRef.current.sort?.includes("starts_at:DESC") ?? true}
						// 						onChange={() => handleFilter("sort", ["starts_at:DESC"])}
						// 						className="mr-2 cursor-pointer"
						// 					/>
						// 					Upcoming
						// 				</label>
						// 				<label className="flex items-center cursor-pointer">
						// 					<input
						// 						type="checkbox"
						// 						checked={filterRef.current.sort?.includes("starts_at:ASC") ?? false}
						// 						onChange={() => handleFilter("sort", ["starts_at:ASC"])}
						// 						className="mr-2 cursor-pointer"
						// 					/>
						// 					Past
						// 				</label>
						// 			</div>
						// 		);
						// 	},
						// }}
						className="mr-4 sm:mr-0"
					/>
					<Link href="/settings/promo-codes/create" className="ml-auto">
						<Button label="Add Promo Code" showIcon className="hidden sm:flex" />
						<IconAddButton className="sm:hidden" />
					</Link>
				</div>
			}
		>
			<div className="flex flex-wrap">
				{data?.map((code) => (
					<Card key={code.id} className="p-4 pr-3 w-[270px] flex mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-700">
						<div className="flex flex-col w-full">
							<div className="flex items-center w-full text-neutral-900">
								<p className="text-lg font-semibold">{code.code}</p>
								<ResponsiveActionMenu
									title={code.code}
									className="ml-auto"
									onEdit={() => {
										router.push(`/settings/promo-codes/${code.id}/edit`);
									}}
									onDelete={() => handleDelete(code)}
								/>
							</div>
							<div className="flex flex-row items-center space-x-1 mt-3">
								<TicketPercentIcon className="" strokeWidth={2} size={24} />
								<span className="text-sm">{`${code.percent_off}% Off` || "N/A"}</span>
							</div>
							<div className="flex flex-row items-center space-x-1">
								<TicketIcon className="" strokeWidth={2} size={24} />
								<span className="text-sm">{`${code.voucher_to_generate ?? 0} Voucher` || "N/A"}</span>
							</div>
							<div className="flex flex-row items-center space-x-1">
								<TicketXIcon className="" strokeWidth={2} size={24} />
								{/* <span>Exp:</span> */}
								<span className="text-sm">{code.expires_at ? formatDateToLocal(code.expires_at) : "N/A"}</span>
							</div>
						</div>
					</Card>
				))}
			</div>
			{pagination && pagination.page < pagination.max_page && (
				<div ref={ref} className="flex justify-center mt-5">
					<Loader />
					<span>Loading...</span>
				</div>
			)}
		</DataList>
	);
}
