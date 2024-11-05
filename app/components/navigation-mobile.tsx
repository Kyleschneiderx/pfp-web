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
  ];

  const { setIsOpen } = useToggle();

  return (
    <aside className="w-[250px] shadow-xl flex flex-col h-[calc(100vh-138px)] bg-white pt-8 z-50">
      <nav>
        {navItems.map(({ title, url, icon }, index) => (
          <Link
            key={index}
            href={url}
            className={clsx(
              "flex items-center py-4 pl-[35px] hover:bg-primary-50 hover:border-r-4 hover:border-primary-500 group",
              pathname.startsWith(url) &&
                "bg-primary-100 border-r-4 border-primary-500"
            )}
            onClick={() => setIsOpen(false)}
          >
            <span className="mr-3">{icon}</span>
            <span className="text-neutral-600 font-medium">{title}</span>
          </Link>
        ))}
      </nav>
      <div
        onClick={logout}
        className="flex items-center pl-9 mt-auto mb-[25px] space-x-2 text-red-400 cursor-pointer"
      >
        <LogOut size={16} />
        <p>Logout</p>
      </div>
    </aside>
  );
}
