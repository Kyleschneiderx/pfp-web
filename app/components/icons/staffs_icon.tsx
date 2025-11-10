"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { type IconProps, IconUsersGroup } from "@tabler/icons-react";

interface Props extends IconProps {
	activeUrl: string;
}

export default function StaffIcon({ activeUrl, ...rest }: Props) {
	const pathname = usePathname();
	return (
		<IconUsersGroup
			className={clsx(
				"w-6 h-6 text-neutral-400 group-hover:text-primary-500",
				pathname.startsWith(activeUrl) && "text-primary-500",
			)}
			{...rest}
		/>
	);
}
