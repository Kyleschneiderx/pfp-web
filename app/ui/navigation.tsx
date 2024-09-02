import Image from "next/image";
import Link from "next/link";
import DashboardIcon from "./icons/dashboard_icon";
import EducationIcon from "./icons/education_icon";
import ExerciseIcon from "./icons/exercise_icon";
import PatientIcon from "./icons/patient_icon";
import PFPlanIcon from "./icons/pfplan_icon";
import WorkoutIcon from "./icons/workout_icon";

export default function Navigation() {
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <DashboardIcon />,
    },
    {
      title: "Patients",
      url: "/patients",
      icon: <PatientIcon />,
    },
    {
      title: "Exercises",
      url: "/exercises",
      icon: <ExerciseIcon />,
    },
    {
      title: "Workouts",
      url: "/workouts",
      icon: <WorkoutIcon />,
    },
    {
      title: "PF Plans",
      url: "/pf-plans",
      icon: <PFPlanIcon />,
    },
    {
      title: "Education",
      url: "/education",
      icon: <EducationIcon />,
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
            className="nav-link flex items-center py-5 pl-9 hover:bg-primary-100 hover:border-r-4 hover:border-primary-500 group"
          >
            <span className="mr-3">{icon}</span>
            <span className="text-neutral-600 font-medium">{title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
