"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { IconCopy, type IconProps } from "@tabler/icons-react";

interface Props extends IconProps {
	activeUrl: string;
}

export default function ContentIcon({ activeUrl, ...rest }: Props) {
	const pathname = usePathname();
	return (
		<IconCopy
			className={clsx(
				"w-6 h-6 text-neutral-400 group-hover:text-primary-500",
				pathname.startsWith(activeUrl) && "text-primary-500",
			)}
			{...rest}
		/>
	);
}
