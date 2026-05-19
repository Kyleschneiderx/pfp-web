"use client";

import {
	OWNERSHIP_TAB_ALL,
	OWNERSHIP_TAB_OWN,
	OWNERSHIP_TAB_SYSTEM,
	ownershipTabFromSearchParams,
} from "@/app/lib/ownership-filter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

type OwnershipTabsProps = {
	children: ReactNode;
	className?: string;
};

export default function OwnershipTabs({ children, className }: OwnershipTabsProps) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeTab = ownershipTabFromSearchParams(searchParams.get("ownership"));

	const handleChangeTab = (value: string) => {
		const params = new URLSearchParams(searchParams.toString());

		if (value === OWNERSHIP_TAB_ALL) {
			params.delete("ownership");
		} else {
			params.set("ownership", value);
		}

		params.delete("page");

		router.replace(`${pathname}?${params.toString()}`);
	};

	return (
		<Tabs value={activeTab} onValueChange={handleChangeTab} className={className}>
			<TabsList className="mb-3">
				<TabsTrigger value={OWNERSHIP_TAB_ALL}>All</TabsTrigger>
				<TabsTrigger value={OWNERSHIP_TAB_SYSTEM}>System</TabsTrigger>
				<TabsTrigger value={OWNERSHIP_TAB_OWN}>Own</TabsTrigger>
			</TabsList>
			<TabsContent value={activeTab}>{children}</TabsContent>
		</Tabs>
	);
}
