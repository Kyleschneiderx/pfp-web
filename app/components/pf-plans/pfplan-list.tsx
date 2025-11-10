"use client";

import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { PERMISSIONS } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import type { ErrorModel } from "@/app/models/error_model";
import type { PfPlanModel } from "@/app/models/pfplan_model";
import { deletePfPlan, duplicatePfPlan, savePfPlan } from "@/app/services/client_side/pfplans";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CardBanner from "../elements/CardBanner";
import Loader from "../elements/Loader";
import StatusBadge from "../elements/StatusBadge";
import { fetchPfPlans } from "./action";
import DataList from "../data-list";
import SearchCmp from "../elements/SearchCmp";
import CommonSort from "../common-sort";
import Link from "next/link";
import Button from "../elements/Button";
import IconAddButton from "../elements/mobile/IconAddButton";
import { useModal } from "@/app/contexts/ModalContext";
import useAuth from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toFormData } from "@/app/lib/utils";
import RenameModal from "../modals/rename-modal";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { IconCopy, IconTransfer } from "@tabler/icons-react";

interface Props {
	name: string;
	sort: string;
	initialList: PfPlanModel[] | [];
	maxPage: number;
}

export default function PfPlanList({ name, sort, initialList, maxPage }: Props) {
	const modal = useModal();
	const { hasPermission } = useAuth();
	const router = useRouter();

	const [pfPlans, setPfPlans] = useState(initialList);
	const [page, setPage] = useState(1);
	const [ref, inView] = useInView();

	const { showSnackBar } = useSnackBar();

	const loadMorePfPlans = async () => {
		const next = page + 1;
		const { pfPlanList } = await fetchPfPlans({
			page: next,
			name,
			sort,
		});
		if (pfPlanList.length) {
			setPage(next);
			setPfPlans((prev: PfPlanModel[]) => [...(prev?.length ? prev : []), ...pfPlanList]);
		}
	};

	useEffect(() => {
		if (inView && page < maxPage) {
			loadMorePfPlans();
		}
	}, [inView]);

	useEffect(() => {
		setPfPlans(initialList);
		setPage(1);
	}, [sort, name, initialList]);

	const handleDelete = async (pfPlan: PfPlanModel) => {
		modal.open({
			type: "confirm",
			title: "Delete PF Plan",
			message: "Are you you want to delete this pf plan?",
			onConfirm: async () => {
				try {
					await deletePfPlan(pfPlan!.id);
					await revalidatePage("/contents/pf-plans");
					showSnackBar({
						message: "PF Plan successfully deleted.",
						success: true,
					});
					modal.closeAll();
				} catch (error) {
					const apiError = error as ErrorModel;

					if (apiError?.msg) {
						showSnackBar({ message: apiError.msg, success: false });
					}
				}
			},
		});
	};

	const handleDuplicate = async (pfPlan: PfPlanModel) => {
		modal.open({
			type: "confirm",
			title: "Duplicate PF Plan",
			message: "Are you you want to duplicate this pf plan?",
			onConfirm: async () => {
				try {
					await duplicatePfPlan(pfPlan!.id);
					await revalidatePage("/contents/pf-plans");
					showSnackBar({
						message: "PF Plan successfully duplicated.",
						success: true,
					});
					modal.closeAll();
				} catch (error) {
					const apiError = error as ErrorModel;

					if (apiError?.msg) {
						showSnackBar({ message: apiError.msg, success: false });
					}
				}
			},
		});
	};

	const handleRename = async (pfPlan: PfPlanModel) => {
		modal.open({
			type: "default",
			title: "Rename PF Plan",
			component: ({ close }) => {
				return (
					<RenameModal
						data={pfPlan}
						type={"pfplan"}
						onClose={close}
						onSubmit={async ({ name }) => {
							try {
								const formData = toFormData({ name });
								await savePfPlan({ method: "PUT", id: pfPlan!.id, body: formData });
								await revalidatePage("/contents/pf-plans");
								showSnackBar({
									message: "PF plan successfully renamed.",
									success: true,
								});
								modal.closeAll();
							} catch (error) {
								const apiError = error as ErrorModel;

								if (apiError?.msg) {
									showSnackBar({ message: apiError.msg, success: false });
								}
							}
						}}
					/>
				);
			},
		});
	};

	return (
		<DataList
			data={pfPlans}
			header={
				<div className="flex items-center mb-8">
					<SearchCmp placeholder="Search PF Plan" className="mr-4 sm:mr-0" />
					<CommonSort field="name" />
					{hasPermission(PERMISSIONS.PFPLAN_CREATE) && (
						<Link href="/contents/pf-plans/create" className="ml-auto">
							<Button label="Add Plan" showIcon className="hidden sm:flex" />
							<IconAddButton className="sm:hidden" />
						</Link>
					)}
				</div>
			}
		>
			<div className="flex flex-wrap">
				{pfPlans.map((pfplan) => (
					<div key={pfplan.id} className="w-[351px] mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900">
						<CardBanner url={pfplan.photo} />
						<Card className="min-h-[202px] rounded-t-none py-4 px-5">
							<div className="flex">
								<StatusBadge label={pfplan.status.value} />
								{hasPermission([PERMISSIONS.PFPLAN_EDIT, PERMISSIONS.PFPLAN_DELETE, PERMISSIONS.PFPLAN_DUPLICATE]) && (
									<ResponsiveActionMenu
										title={pfplan.name}
										className="cursor-pointer ml-auto"
										onEdit={
											hasPermission(PERMISSIONS.PFPLAN_EDIT)
												? () => router.push(`/contents/workouts/${pfplan.id}/edit`)
												: undefined
										}
										onDelete={hasPermission(PERMISSIONS.PFPLAN_DELETE) ? () => handleDelete(pfplan) : undefined}
										customActions={[
											...(hasPermission(PERMISSIONS.PFPLAN_EDIT)
												? [
														{
															label: "Rename",
															icon: <IconTransfer size={16} />,
															onClick: () => handleRename(pfplan),
														},
													]
												: []),
											...(hasPermission(PERMISSIONS.PFPLAN_DUPLICATE)
												? [
														{
															label: "Duplicate",
															icon: <IconCopy size={16} />,
															onClick: () => handleDuplicate(pfplan),
														},
													]
												: []),
										]}
									/>
								)}
							</div>
							<p className="text-lg font-semibold leading-tight mt-[8px] mb-[6px]" title={pfplan.name}>
								{pfplan.name}
							</p>
							<p className="text-sm text-neutral-700 mt-1 line-clamp-5" title={pfplan.description}>
								{pfplan.description}
							</p>
						</Card>
					</div>
				))}
			</div>
			{page < maxPage && (
				<div ref={ref} className="flex justify-center mt-5">
					<Loader />
					<span>Loading...</span>
				</div>
			)}
		</DataList>
	);
}
