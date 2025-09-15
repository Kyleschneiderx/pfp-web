"use client";

import { EllipsisIcon, LogOut, Menu, TabletSmartphoneIcon } from "lucide-react";
import Image from "next/image";
import { useToggle } from "../store/store";
import { DropdownMenu } from "radix-ui";
import { useLogout } from "../hooks/useLogout";
import { useModal } from "../contexts/ModalContext";
import SendPushNotificationModal from "./modals/send-push-notification";
import useAuth from "../hooks/useAuth";
import { usePathname } from "next/navigation";

export default function Header() {
	const logout = useLogout();
	const user = useAuth();
	const userName = user.user_profile.name;
	const userEmail = user.email;
	const modal = useModal();
	const pathname = usePathname();

	const pathnameSet = pathname.split("/");
	pathnameSet.shift();
	const page = [...pathnameSet].pop();
	!pathname.includes("dashboard") && pathnameSet.unshift("Dashboard");

	const { isOpen, setIsOpen } = useToggle();

	return (
		<header className="py-3 px-4 border-b border-neutral-300 flex items-center">
			<div className="flex flex-row flex-1 items-center">
				<Menu className="mr-2 md:hidden w-6 h-6" onClick={() => setIsOpen(!isOpen)} />
				<div className="flex-col hidden md:flex ml-2 ">
					<span className="capitalize font-medium text-xl ">{page}</span>
					<span className="capitalize text-neutral-500 text-sm hidden md:block ">{pathnameSet.join(" / ")}</span>
				</div>
				<Image
					src="/images/logo.jpg"
					alt="Logo"
					width={106}
					height={50}
					quality={100}
					className="w-[106px] h-[50px] md:hidden"
					priority
				/>
			</div>
			<div className="w-auto flex flex-row items-center">
				<div className="text-right mr-2 sm:mr-3">
					<span className="block font-medium text-neutral-900  overflow-hidden text-ellipsis whitespace-nowrap">
						{userName}
					</span>
					<span className="block text-sm text-neutral-700  overflow-hidden text-ellipsis">{userEmail}</span>
				</div>
				<div>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild className="cursor-pointer">
							<Image
								src="/images/avatar.png"
								alt="Logo"
								width={55}
								height={55}
								quality={100}
								className="rounded-full sm:mr-3 h-[55px] w-[55px]"
							/>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							align="end"
							className="w-[170px] drop-shadow-center text-sm p-1 bg-white rounded-md z-20 text-neutral-900"
						>
							<DropdownMenu.Item
								onClick={() => {
									modal.open({
										title: "Send Push Notification",
										type: "default",
										component: <SendPushNotificationModal />,
									});
								}}
								className="cursor-pointer p-2 bg-white flex items-center justify-start outline-none hover:bg-primary-100"
							>
								<TabletSmartphoneIcon className="mr-2" size={16} />
								<span>Push Notification</span>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onClick={logout}
								className="cursor-pointer p-2 bg-white flex items-center justify-start text-red-400 outline-none hover:bg-primary-100"
							>
								<LogOut className="mr-2" size={16} />
								<span>Logout</span>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		</header>
	);
}
