"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";

interface Props {
  activeUrl: string;
}

export default function DashboardIcon({ activeUrl }: Props) {
  const pathname = usePathname();
  return (
    <svg
      className={clsx(
        "w-6 h-6 text-neutral-400 group-hover:text-primary-500",
        pathname.startsWith(activeUrl) && "text-primary-500"
      )}
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Group">
        <path
          id="Vector"
          d="M7.83711 8.9502C10.1621 8.9502 12.0746 7.1127 12.0746 4.8252C12.0746 2.5377 10.1621 0.700195 7.83711 0.700195C5.51211 0.700195 3.59961 2.5377 3.59961 4.8252C3.59961 7.1127 5.51211 8.9502 7.83711 8.9502ZM7.83711 2.4252C9.22461 2.4252 10.3871 3.5127 10.3871 4.8627C10.3871 6.2127 9.26211 7.30019 7.83711 7.30019C6.41211 7.30019 5.28711 6.2127 5.28711 4.8627C5.28711 3.5127 6.44961 2.4252 7.83711 2.4252Z"
        />
        <path
          id="Vector_2"
          d="M17.2498 10.75C19.2748 10.75 20.8873 9.175 20.8873 7.1875C20.8873 5.2 19.2373 3.625 17.2498 3.625C15.2623 3.625 13.6123 5.2 13.6123 7.1875C13.6123 9.175 15.2623 10.75 17.2498 10.75ZM17.2498 5.35C18.3373 5.35 19.1998 6.175 19.1998 7.225C19.1998 8.275 18.3373 9.1 17.2498 9.1C16.1623 9.1 15.2998 8.275 15.2998 7.225C15.2998 6.175 16.1623 5.35 17.2498 5.35Z"
        />
        <path
          id="Vector_3"
          d="M17.4373 11.1254H17.0998C15.9748 11.1254 14.8873 11.4629 13.9498 12.0254C12.9373 10.6754 11.3248 9.77539 9.52481 9.77539H6.1873C3.1123 9.81289 0.674805 12.2504 0.674805 15.2879V17.9879C0.674805 18.7004 1.2373 19.2629 1.9498 19.2629H22.0873C22.7998 19.2629 23.3998 18.6629 23.3998 17.9504V17.0504C23.3623 13.7879 20.6998 11.1254 17.4373 11.1254ZM2.3623 17.5754V15.2879C2.3623 13.1879 4.0873 11.4629 6.1873 11.4629H9.52481C11.6248 11.4629 13.3498 13.1879 13.3498 15.2879V17.5754H2.3623ZM21.6748 17.5754H14.9998V15.2879C14.9998 14.6879 14.8873 14.0879 14.6998 13.5254C15.3748 13.0379 16.1998 12.8129 17.0623 12.8129H17.3998C19.7248 12.8129 21.6373 14.7254 21.6373 17.0504V17.5754H21.6748Z"
        />
      </g>
    </svg>
  );
}