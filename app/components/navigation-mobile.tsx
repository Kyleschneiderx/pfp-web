"use client";

import { useLogout } from "@/app/hooks/useLogout";
import clsx from "clsx";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToggle } from "../store/store";
import DashboardIcon from "./icons/dashboard_icon";
import EducationIcon from "./icons/education_icon";
import ExerciseIcon from "./icons/exercise_icon";
import PatientIcon from "./icons/patient_icon";
import PFPlanIcon from "./icons/pfplan_icon";
import WorkoutIcon from "./icons/workout_icon";
import ChatIcon from "./icons/chat_icon";
import SettingsIcon from "./icons/settings";
import TelehealthIcon from "./icons/telehealth_icon";

export default function NavigationMobile() {
	const logout = useLogout();
	const pathname = usePathname();

	const navItems = [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: <DashboardIcon activeUrl="/dashboard" />,
		},
		{
			title: "Patients",
			url: "/patients",
			icon: <PatientIcon activeUrl="/patients" />,
		},
		{
			title: "Exercises",
			url: "/exercises",
			icon: <ExerciseIcon activeUrl="/exercises" />,
		},
		{
			title: "Workouts",
			url: "/workouts",
			icon: <WorkoutIcon activeUrl="/workouts" />,
		},
		{
			title: "PF Plans",
			url: "/pf-plans",
			icon: <PFPlanIcon activeUrl="/pf-plans" />,
		},
		{
			title: "Education",
			url: "/education",
			icon: <EducationIcon activeUrl="/education" />,
		},
		{
			title: "Telehealth",
			url: "/telehealth",
			icon: <TelehealthIcon activeUrl="/telehealth" />,
		},
		{
			title: "Support Chat",
			url: "/support-chat",
			icon: <ChatIcon activeUrl="/support-chat" />,
		},
		{
			title: "Settings",
			url: "/settings",
			icon: <SettingsIcon activeUrl="/settings" />,
			subItems: [
				{
					title: "AI Coach",
					url: "/settings/ai-coach",
				},
			],
		},
	];

	const { isOpen, setIsOpen } = useToggle();

	return (
		<>
			<div
				className={clsx(
					"absolute h-screen md:hidden z-50 left-0 top-0 transform transition-transform duration-300 ease-in-out",
					isOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<aside className="w-[250px] shadow-xl flex flex-col bg-white py-8 h-full z-50 overflow-y-auto">
					<nav className="flex-grow">
						{navItems.map((item, index) => {
							return (
								<div key={index}>
									{item?.subItems?.length ? (
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
												{item.subItems.map((subItem, subIndex) => (
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
									) : (
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
									)}
								</div>
							);
						})}
					</nav>
					<div
						onClick={logout}
						className="flex items-center pl-9 mb-[70px] space-x-2 text-red-400 cursor-pointer select-none"
					>
						<LogOut size={16} />
						<p>Logout</p>
					</div>
				</aside>
			</div>

			{isOpen && (
				<div
					className="absolute h-screen inset-0 top-0 bg-black opacity-50 z-40"
					onKeyDown={undefined}
					onClick={() => setIsOpen(false)}
				/>
			)}
		</>
	);
}
