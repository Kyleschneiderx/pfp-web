import { getAdminList } from "@/app/components/admins/actions";
import AdminList from "@/app/components/admins/admin-list";
import Button from "@/app/components/elements/Button";
import FilterList from "@/app/components/elements/FilterList";
import IconAddButton from "@/app/components/elements/mobile/IconAddButton";
import RoleList from "@/app/components/roles/role-list";
import { PAGE_ITEMS, ROLES } from "@/app/lib/constants";
import type { Account } from "@/app/models/accounts";
import type { List } from "@/app/models/global_model";
import type { AccountsSearchQuery } from "@/app/services/server_side/accounts";
import Link from "next/link";

export default async function Page({
	searchParams,
}: {
	searchParams?: AccountsSearchQuery;
}) {
	return <RoleList />;
}
