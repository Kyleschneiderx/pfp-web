"use client";

import { CalendarDaysIcon, EllipsisIcon, LogOut, Menu, TabletSmartphoneIcon } from "lucide-react";
import Image from "next/image";
import { useToggle } from "../store/store";
import { useLogout } from "../hooks/useLogout";
import { useModal } from "../contexts/ModalContext";
import SendPushNotificationModal from "./modals/send-push-notification";
import useAuth from "../hooks/useAuth";
import { usePathname } from "next/navigation";
import type { Schedule } from "../models/schedules";
import ManageScheduleModal from "./modals/manage-schedule-modal";
import { useSnackBar } from "../contexts/SnackBarContext";
import ResponsiveActionMenu from "./elements/ResponsiveActionMenu";

export default function Header() {
	const logout = useLogout();
	const user = useAuth();
	const userName = user.user_profile.name;
	const userEmail = user.email;
	const modal = useModal();
	const pathname = usePathname();
	const { showSnackBar } = useSnackBar();

	const pathnameSet = pathname.split("/");
	pathnameSet.shift();
	const page = [...pathnameSet].pop();
	!pathname.includes("dashboard") && pathnameSet.unshift("Dashboard");

	const { isOpen, setIsOpen } = useToggle();

	const handleOpenSchedule = (schedule?: Schedule) => {
		modal.open({
			type: "default",
			title: "Manage Schedule",
			allowClose: true,
			className: "max-h-[75%] overflow-auto w-[90%] sm:w-[500px] max-w-[500px]",
			component: ({ close }) => <ManageScheduleModal onClose={close} />,
		});
	};

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
					<ResponsiveActionMenu
						title="Menu"
						icon={
							<Image
								src="/images/avatar.png"
								alt="Logo"
								width={55}
								height={55}
								quality={100}
								className="rounded-full sm:mr-3 h-[55px] w-[55px]"
							/>
						}
						customActions={[
							{
								label: "Push Notification",
								icon: <TabletSmartphoneIcon className="mr-2" size={16} />,
								onClick: () => {
									modal.open({
										title: "Send Push Notification",
										type: "default",
										component: <SendPushNotificationModal />,
									});
								},
							},
							{
								label: "Schedule",
								icon: <CalendarDaysIcon className="mr-2" size={16} />,
								onClick: handleOpenSchedule,
							},
							{
								label: "Logout",
								icon: <LogOut className="mr-2" size={16} />,
								onClick: logout,
								className: "!text-red-400",
							},
						]}
					/>
				</div>
			</div>
		</header>
	);
}
