// import EducationIcon from "/public/svg/books.svg";
// import PFPlansIcon from "/public/svg/customer.svg";
// import ExercisesIcon from "/public/svg/footsteps.svg";
// import WorkoutsIcon from "/public/svg/head-idea-setting.svg";
// import PatientsIcon from "/public/svg/patients.svg";

import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Navigation() {
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutGrid className="icon-fill text-neutral-400" />,
    },
    {
      title: "Patients",
      url: "/patients",
      icon: <LayoutGrid className="icon-fill text-neutral-400" />,
    },
    {
      title: "Exercises",
      url: "/exercises",
      icon: <LayoutGrid className="icon-fill text-neutral-400" />,
    },
    {
      title: "Workouts",
      url: "/workouts",
      icon: <LayoutGrid className="icon-fill text-neutral-400" />,
    },
    {
      title: "PF Plans",
      url: "/pf-plans",
      icon: <LayoutGrid className="icon-fill text-neutral-400" />,
    },
    {
      title: "Education",
      url: "/education",
      icon: <LayoutGrid className="icon-fill text-neutral-400" />,
    },
  ];

  return (
    <aside className="w-[350px] shadow-xl">
      <Image
        src="/images/logo.jpg"
        alt="Logo"
        width={172}
        height={80}
        className="ml-9 my-10"
      />
      <nav>
        {navItems.map(({ title, url, icon }, index) => (
          <Link
            key={index}
            href={url}
            className="nav-link flex items-center py-5 pl-9 hover:bg-primary-100 hover:border-r-4 hover:border-primary-500"
          >
            <span className="mr-3">{icon}</span>
            <span className="text-neutral-600 font-medium">{title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
