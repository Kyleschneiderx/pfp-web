"use client";

import Cookies from "js-cookie";
import { EllipsisIcon, LogOut, Menu, TabletSmartphoneIcon } from "lucide-react";
import Image from "next/image";
import { useToggle } from "../store/store";
import { DropdownMenu } from "radix-ui";
import { useLogout } from "../hooks/useLogout";
import { useModal } from "../contexts/ModalContext";
import SendPushNotificationModal from "./modals/send-push-notification";

export default function Header() {
	const logout = useLogout();
	const userName = Cookies.get("user_name");
	const userEmail = Cookies.get("user_email");
	const modal = useModal();

	const { isOpen, setIsOpen } = useToggle();

	return (
		<header className="py-3 px-4 border-b border-neutral-300 flex items-center">
			<Menu className="mr-2 sm:hidden" onClick={() => setIsOpen(!isOpen)} />
			<Image
				src="/images/logo.jpg"
				alt="Logo"
				width={106}
				height={50}
				quality={100}
				className="w-[106px] h-[50px] sm:hidden"
				priority
			/>
			<div className="text-right ml-auto mr-2 sm:mr-3">
				<span className="block font-medium text-neutral-900 w-[100px] sm:w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
					{userName}
				</span>
				<span className="block text-sm text-neutral-700 w-[105px] sm:w-[300px] overflow-hidden text-ellipsis">
					{userEmail}
				</span>
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
		</header>
	);
}
