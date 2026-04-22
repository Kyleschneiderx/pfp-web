"use client";

import { IconKey, IconUser } from "@tabler/icons-react";
import { CalendarDaysIcon, EllipsisIcon, LogOut, Menu, TabletSmartphoneIcon } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useModal } from "../contexts/ModalContext";
import { useSnackBar } from "../contexts/SnackBarContext";
import useAuth from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { useToggle } from "../store/store";
import ResponsiveActionMenu from "./elements/ResponsiveActionMenu";
import ChangePasswordModal from "./modals/change-password-modal";
import SendPushNotificationModal from "./modals/send-push-notification";

export default function Header() {
	const logout = useLogout();
	const { user, hasPermission } = useAuth();
	const router = useRouter();
	const userName = user?.user_profile.name;
	const userEmail = user?.email;
	const modal = useModal();
	const pathname = usePathname();
	const { showSnackBar } = useSnackBar();

	const pathnameSet = pathname.split("/");
	pathnameSet.shift();
	const page = [...pathnameSet].pop();
	!pathname.includes("dashboard") && pathnameSet.unshift("Dashboard");

	const { isOpen, setIsOpen } = useToggle();

	const handleChangePassword = async () => {
		modal.open({
			type: "default",
			title: "Change Password",
			component: <ChangePasswordModal account={user!} validateOldPassword onClose={() => modal.closeAll()} />,
		});
	};

	return (
		<header className="py-3 px-4 border-b border-neutral-300 flex items-center">
			<div className="flex flex-row flex-1 items-center">
				<Menu className="mr-2 lg:hidden w-6 h-6" onClick={() => setIsOpen(!isOpen)} />
				<div className="flex-col hidden md:flex ml-2 ">
					{/* <span className="capitalize font-medium text-xl ">{page}</span> */}
					{/* <span className="capitalize text-neutral-500 text-sm hidden md:block ">{pathnameSet.join(" / ")}</span> */}
				</div>
			</div>
			<div className="w-auto flex flex-row items-center">
				<div className="text-right mr-2 sm:mr-3 hidden md:block">
					<span className="block font-medium text-neutral-900  overflow-hidden text-ellipsis whitespace-nowrap">
						{userName}
					</span>
					<span className="block text-sm text-neutral-700  overflow-hidden text-ellipsis">{userEmail}</span>
				</div>
				<div>
					<ResponsiveActionMenu
						title="Menu"
						className="cursor-pointer"
						icon={
							<Image
								src={`${user?.user_profile.photo || "/images/avatar.png"}`}
								alt="Logo"
								width={55}
								height={55}
								quality={100}
								className="rounded-full h-[55px] w-[55px] object-cover"
							/>
						}
						customActions={[
							{
								label: "Profile",
								icon: <IconUser className="mr-2" size={16} />,
								onClick: () => router.push("/profile"),
							},
							{
								label: "Change Password",
								icon: <IconKey className="mr-2" size={16} />,
								onClick: () => handleChangePassword(),
							},
							...(hasPermission([])
								? [
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
									]
								: []),
							{
								label: "Schedule",
								icon: <CalendarDaysIcon className="mr-2" size={16} />,
								onClick: () => router.push("/settings/schedules"),
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
