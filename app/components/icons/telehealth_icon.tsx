"use client";

import clsx from "clsx";
import { CalendarCogIcon } from "lucide-react";
import { usePathname } from "next/navigation";

interface Props {
	activeUrl: string;
}

export default function TelehealthIcon({ activeUrl }: Props) {
	const pathname = usePathname();
	return (
		<CalendarCogIcon
			className={clsx(
				"w-6 h-6 text-neutral-400 group-hover:text-primary-500",
				pathname.startsWith(activeUrl) && "text-primary-500",
			)}
		/>
	);
}
