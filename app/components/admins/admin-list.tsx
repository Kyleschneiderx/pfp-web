"use client";

import { useModal } from "@/app/contexts/ModalContext";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDateToLocal } from "@/app/lib/utils";
import type { Account } from "@/app/models/accounts";
import type { ErrorModel } from "@/app/models/error_model";
import type { List } from "@/app/models/global_model";
import { deleteAccount, reset2FA } from "@/app/services/client_side/accounts";
import type { AccountsSearchQuery } from "@/app/services/server_side/accounts";
import { IconKey, IconUserScan } from "@tabler/icons-react";
import { EllipsisIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import Button from "../elements/Button";
import DataTable, { type Column } from "../elements/DataTable";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import IconAddButton from "../elements/mobile/IconAddButton";
import ChangePasswordModal from "../modals/change-password-modal";

export default function AdminList({
	data,
	search,
}: {
	data?: List<Account>;
	search?: AccountsSearchQuery;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const modal = useModal();

	const { showSnackBar } = useSnackBar();

	const admins = data?.data ?? [];

	const page = Number(search?.page ?? 1);
	const maxPage = data?.max_page ?? 1;

	const [searchInput, setSearchInput] = useState(search?.search ?? "");

	useEffect(() => {
		setSearchInput(search?.search ?? "");
	}, [search?.search]);

	const updateParams = (updates: Record<string, string | undefined>) => {
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
	};

	const handleSearch = useDebouncedCallback((term: string) => {
		updateParams({ search: term });
	}, 300);

	const onPageChange = (nextPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(nextPage));
		router.replace(`${pathname}?${params.toString()}`);
	};

	const handleDelete = async (data: Account) => {
		modal.open({
			type: "confirm",
			title: "Delete Admin",
			message: "Are you sure you want to remove this admin?",
			onConfirm: async () => {
				try {
					await deleteAccount(data.id!);

					await revalidatePage("/accounts/admins");

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

					await revalidatePage("/accounts/admins");

					showSnackBar({
						message: "2FA authentication reset successfully.",
						success: true,
					});

					modal.closeAll();
				} catch (e) {
					const error = e as ErrorModel;
					showSnackBar({ message: error.msg, success: false });
				}
			},
		});
	};

	const columns: Column<Account>[] = [
		{
			header: "Admin",
			accessor: (admin) => (
				<Link
					href={`/accounts/admins/${admin.id}/edit`}
					className="flex items-center gap-3 min-w-[220px] hover:opacity-80 transition-opacity"
				>
					<Image
						src={admin.user_profile?.photo || "/images/avatar.png"}
						width={36}
						height={36}
						alt=""
						quality={100}
						className="w-9 h-9 rounded-full object-cover shrink-0"
					/>
					<div className="min-w-0">
						<div className="font-medium text-primary-500 truncate">{admin.user_profile?.name}</div>
						<div className="text-xs text-neutral-600 truncate">{admin.email}</div>
					</div>
				</Link>
			),
		},
		{
			header: "Last Login",
			accessor: (admin) => (admin.last_login_at ? formatDateToLocal(new Date(admin.last_login_at)) : "—"),
			className: "whitespace-nowrap",
		},
		{
			header: "Created",
			accessor: (admin) => (admin.created_at ? formatDateToLocal(new Date(admin.created_at)) : "—"),
			className: "whitespace-nowrap",
		},
		{
			header: "Actions",
			accessor: (admin) => (
				<div className="flex justify-end">
					<ResponsiveActionMenu
						icon={
							<EllipsisIcon
								size={24}
								className="border border-primary-500 bg-primary-500 rounded-full p-1 text-white font-bold hover:bg-primary-600"
							/>
						}
						title={admin.user_profile?.name ?? "Actions"}
						onEdit={() => router.push(`/accounts/admins/${admin.id}/edit`)}
						onDelete={() => handleDelete(admin)}
						customActions={[
							{
								label: "Change Password",
								icon: <IconKey width={18} />,
								onClick: () => handleChangePassword(admin),
							},
							{
								label: "Reset 2FA Authentication",
								icon: <IconUserScan width={18} />,
								onClick: () => handleReset2FA(admin),
							},
						]}
					/>
				</div>
			),
			className: "w-[80px]",
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div className="flex flex-col gap-2">
					<span className="text-lg font-semibold text-neutral-900">Admins</span>
					<p className="text-sm text-neutral-500 max-w-[700px]">Manage administrator accounts and access.</p>
				</div>
				<Link href="/accounts/admins/create">
					<Button label="Add Admin" showIcon className="hidden sm:flex" />
					<IconAddButton className="sm:hidden" />
				</Link>
			</div>

			<DataTable
				columns={columns}
				data={admins}
				getRowKey={(row) => row.id ?? `${row.email}`}
				emptyMessage={!admins.length ? (searchInput ? "No admins match your search" : "No admins found.") : undefined}
				searchPlaceholder="Search admins..."
				searchValue={searchInput}
				onSearch={(v) => {
					setSearchInput(v);
					handleSearch(v);
				}}
				page={page}
				maxPage={maxPage}
				onPageChange={onPageChange}
			/>
		</div>
	);
}
