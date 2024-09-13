"use client";

import { useLogout } from "@/app/hooks/useLogout";
import clsx from "clsx";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardIcon from "./icons/dashboard_icon";
import EducationIcon from "./icons/education_icon";
import ExerciseIcon from "./icons/exercise_icon";
import PatientIcon from "./icons/patient_icon";
import PFPlanIcon from "./icons/pfplan_icon";
import WorkoutIcon from "./icons/workout_icon";

export default function Navigation() {
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

  return (
    <aside className="min-w-[245px] shadow-xl flex flex-col h-screen">
      <Image
        src="/images/logo.jpg"
        alt="Logo"
        width={172}
        height={80}
        className="ml-9 my-10"
        priority
      />
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
          >
            <span className="mr-3">{icon}</span>
            <span className="text-neutral-600 font-medium">{title}</span>
          </Link>
        ))}
      </nav>
      <div
        onClick={logout}
        className="flex items-center mt-auto mb-10 pl-9 space-x-2 text-red-400 cursor-pointer"
      >
        <LogOut size={16} />
        <p>Logout</p>
      </div>
    </aside>
  );
}
