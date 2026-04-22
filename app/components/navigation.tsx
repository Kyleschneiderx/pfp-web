"use client";

import { useLogout } from "@/app/hooks/useLogout";
import clsx from "clsx";
import { LogOut, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "../hooks/useAuth";
import { useToggle } from "../store/store";
import { NAVIGATIONS } from "./constant";

export default function Navigation() {
	const logout = useLogout();
	const { permissions, hasPermission } = useAuth();
	const pathname = usePathname();
	const { isOpen, setIsOpen } = useToggle();

	const filteredNavigations = NAVIGATIONS.filter(
		(item) => item.permissions === undefined || hasPermission(item.permissions),
	);

	const renderNavItem = (item: (typeof NAVIGATIONS)[0]) => {
		if (!item?.subItems?.length) {
			return (
				<Link
					href={item.url}
					className={clsx(
						"flex items-center py-4 pl-[35px] hover:bg-primary-50 hover:border-r-4 hover:border-primary-500 group",
						pathname.startsWith(item.url) && "bg-primary-100 border-r-4 border-primary-500",
					)}
				>
					<span className="mr-3">{item.icon}</span>
					<span className="text-neutral-600 font-medium">{item.title}</span>
				</Link>
			);
		}

		const filteredSubItems = item.subItems.filter(
			(subItem) => subItem.permissions === undefined || hasPermission(subItem.permissions),
		);

		if (filteredSubItems.length === 0) return null;

		return (
			<details className="group">
				<summary
					className={clsx(
						"flex items-center py-4 pl-[35px] hover:bg-primary-50 hover:border-r-4 hover:border-primary-500 cursor-pointer list-none",
						pathname.startsWith(item.url) && "bg-primary-100 border-r-4 border-primary-500",
						"[&::-webkit-details-marker]:hidden",
					)}
				>
					<span className="mr-3">{item.icon}</span>
					<span className="text-neutral-600 font-medium flex-1">{item.title}</span>
					<span className="mr-4 transition-transform group-open:rotate-90">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-neutral-400">
							<path
								d="M6 4L10 8L6 12"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</span>
				</summary>
				<div className="bg-gray-50/50">
					{filteredSubItems.map((subItem, subIndex) => (
						<Link
							key={subIndex}
							href={subItem.url}
							className={clsx(
								"flex items-center py-3 pl-[70px] pr-4 hover:bg-primary-50 hover:border-r-4 hover:border-primary-500 transition-colors",
								pathname === subItem.url && "bg-primary-100 border-r-4 border-primary-500",
							)}
						>
							<span className="text-neutral-600 font-medium text-sm">{subItem.title}</span>
						</Link>
					))}
				</div>
			</details>
		);
	};

	const sidebarContent = (
		<>
			<nav className="flex-1">{filteredNavigations.map(renderNavItem)}</nav>
			<div onClick={logout} className="flex items-center mt-auto mb-10 pl-9 space-x-2 text-red-400 cursor-pointer">
				<LogOut size={16} />
				<p>Logout</p>
			</div>
		</>
	);

	const logo = (
		<Image src="/images/logo.jpg" alt="Logo" width={172} height={80} quality={100} className="ml-9 my-10" priority />
	);

	return (
		<>
			{/* Mobile/Tablet drawer overlay */}
			{isOpen && (
				<div
					className="absolute h-screen inset-0 top-0 bg-black opacity-50 z-50 lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Mobile/Tablet slide-in drawer */}
			<div
				className={clsx(
					"fixed h-screen lg:hidden z-50 left-0 top-0 transform transition-transform duration-300 ease-in-out",
					"w-[250px]",
					isOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<aside className="bg-white shadow-xl flex flex-col h-full overflow-y-auto py-8">
					{logo}
					{sidebarContent}
				</aside>
			</div>

			{/* Desktop sidebar — visible at lg: (1024px+) */}
			<aside className="min-w-[245px] shadow-xl flex flex-col h-full overflow-auto hidden lg:flex">
				{logo}
				{sidebarContent}
			</aside>
		</>
	);
}
