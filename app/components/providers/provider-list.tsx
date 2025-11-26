"use client";

import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Loader from "../elements/Loader";
import type { PaginationModel, List } from "@/app/models/global_model";
import Image from "next/image";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/contexts/ModalContext";
import { revalidatePage } from "@/app/lib/revalidate";
import type { ErrorModel } from "@/app/models/error_model";
import { IconKey, IconLicense, IconLogin2, IconMail, IconSquarePlus, IconUserScan } from "@tabler/icons-react";
import type { Account } from "@/app/models/accounts";
import { formatDateToLocal } from "@/app/lib/utils";
import { deleteAccount, getAccountPermissions, reset2FA } from "@/app/services/client_side/accounts";
import ChangePasswordModal from "../modals/change-password-modal";
import PermissionModal from "../modals/permission-modal";
import type { AccountsSearchQuery } from "@/app/services/server_side/accounts";
import DataList from "../data-list";
import FilterList from "../elements/FilterList";
import Link from "next/link";
import Button from "../elements/Button";
import IconAddButton from "../elements/mobile/IconAddButton";

export default function ProviderList({
	data,
	search,
}: {
	data?: List<Account>;
	search?: AccountsSearchQuery;
}) {
	const router = useRouter();
	const modal = useModal();
	const [accounts, setAccounts] = useState<Account[]>();
	const [pagination, setPagination] = useState<PaginationModel>();
	const [ref, inView] = useInView();

	const { showSnackBar } = useSnackBar();

	useEffect(() => {
		if (!data) return;

		const { data: list, ...metadata } = data;

		if (metadata.page === 1) {
			setAccounts(list);
		} else {
			setAccounts((prev) => [...(prev ?? []), ...list]);
		}

		setPagination(metadata);
	}, [data]);

	// const loadMoreExercises = async () => {
	// 	const next = page + 1;
	// 	const { exerciseList } = await fetchExercises({
	// 		page: next,
	// 		name,
	// 		sort,
	// 		category_id,
	// 		sets_from,
	// 		sets_to,
	// 		reps_from,
	// 		reps_to,
	// 	});
	// 	if (exerciseList.length) {
	// 		setPage(next);
	// 		setExercises((prev: ExerciseModel[]) => [...(prev?.length ? prev : []), ...exerciseList]);
	// 	}
	// };

	// useEffect(() => {
	// 	if (inView && page < maxPage) {
	// 		loadMoreExercises();
	// 	}
	// }, [inView]);

	// useEffect(() => {
	// 	setExercises(initialList);
	// 	setPage(1);
	// }, [sort, name, category_id, initialList]);

	const handleDelete = async (data: Account) => {
		modal.open({
			type: "confirm",
			title: "Delete Admin",
			message: "Are you sure you want to remove this admin?",
			onConfirm: async () => {
				try {
					await deleteAccount(data.id!);

					await revalidatePage("/accounts/providers");
					modal.closeAll();
				} catch (e) {
					const error = e as ErrorModel;

					showSnackBar({ message: error.msg, success: false });
				}
			},
		});
	};

	const handleChangePassword = async (data: Account) => {
		modal.open({
			type: "default",
			title: "Change Password",
			component: <ChangePasswordModal account={data} onClose={() => modal.closeAll()} />,
		});
	};

	const handleReset2FA = async (data: Account) => {
		modal.open({
			type: "confirm",
			title: "Reset 2FA Authentication",
			message: "Are you sure you want to reset the 2FA authentication for this admin?",
			onConfirm: async () => {
				try {
					await reset2FA(data.id!);

					await revalidatePage("/accounts/providers");

					showSnackBar({ message: "2FA authentication reset successfully.", success: true });

					modal.closeAll();
				} catch (e) {
					const error = e as ErrorModel;
					console.log(error);
					showSnackBar({ message: error.msg, success: false });
				}
			},
		});
	};

	const handleEditPermission = async (account: Account) => {
		try {
			const accountPermissions = await getAccountPermissions(account.id);
			modal.open({
				type: "default",
				title: "Account Permission",
				allowClose: true,
				className: "!min-w-[400px]",
				component: () => <PermissionModal account={account} settings={accountPermissions} />,
			});
		} catch (error) {
			const apiError = error as ErrorModel;
		}
	};

	return (
		<DataList
			data={accounts}
			header={
				<div className="flex items-center mb-8">
					<FilterList
						searchPlaceholder="Search providers"
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
					<Link href="/accounts/providers/create" className="ml-auto">
						<Button label="Add Provider" showIcon className="hidden sm:flex" />
						<IconAddButton className="sm:hidden" />
					</Link>
				</div>
			}
		>
			<div className="flex flex-wrap">
				{accounts?.map((account) => (
					<Card key={account.id} className="p-2 w-[351px] flex mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900">
						<div className="!p-0 w-full flex">
							<Image
								src={account.user_profile?.photo || "/images/avatar.png"}
								width={50}
								height={50}
								alt="Profile pic"
								quality={100}
								className="self-start w-[50px] h-[50px] mr-3 shrink-0 rounded-full object-cover"
							/>
							<div className="flex flex-col space-y-2 flex-grow">
								<div className="flex flex-col flex-grow">
									<div className="flex items-center">
										<p className="text-lg font-semibold mr-auto">{account.user_profile.name}</p>
										<ResponsiveActionMenu
											title={account.user_profile.name}
											className="-mr-2"
											onEdit={() => {
												router.push(`/accounts/providers/${account.id}/edit`);
											}}
											onDelete={() => handleDelete(account)}
											customActions={[
												{
													label: "Change Password",
													icon: <IconKey width={18} />,
													onClick: () => handleChangePassword(account),
												},
												{
													label: "Reset 2FA Authentication",
													icon: <IconUserScan width={18} />,
													onClick: () => handleReset2FA(account),
												},
												{
													label: "Permission",
													icon: <IconLicense width={18} />,
													onClick: () => handleEditPermission(account),
												},
											]}
										/>
									</div>
									<div className="flex items-center space-x-1 text-sm text-neutral-700">
										<span className="">Last Login:</span>
										<span>{formatDateToLocal(new Date(account.last_login_at || ""))}</span>
									</div>
								</div>
								<hr className="my-3" />
								<div className="flex flex-col space-y-1 text-sm text-neutral-700">
									<div className="flex items-center space-x-1">
										<IconMail stroke={2} width={18} />
										<span>{account.email}</span>
									</div>
									<div className="flex items-center space-x-1">
										<IconUserScan stroke={2} width={18} />
										<span>{account.user_profile.npi}</span>
									</div>

									<div className="flex items-center space-x-1">
										<IconSquarePlus stroke={2} width={18} />
										<span>{formatDateToLocal(new Date(account.created_at || ""))}</span>
									</div>
								</div>
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
