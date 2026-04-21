"use client";

import clsx from "clsx";
import { LockKeyhole } from "lucide-react";

export type Props = {
	blur?: "sm" | "md" | "lg";
	rounded?: boolean;
	shadow?: boolean;
	label?: string;
	className?: string;
};

export default function AccessLocked({
	blur = "sm",
	rounded = true,
	shadow = true,
	label = "Restricted",
	className,
}: Props) {
	const blurClass = {
		sm: "backdrop-blur-sm",
		md: "backdrop-blur",
		lg: "backdrop-blur-md",
	}[blur];

	return (
		<div
			className={clsx(
				"relative bg-white overflow-hidden",
				rounded && "rounded-lg",
				shadow && "drop-shadow-center",
				className,
			)}
		>
			<div className={clsx("absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60", blurClass)}>
				<LockKeyhole size={16} strokeWidth={1.5} className="text-neutral-400" />
				<span className="text-xs font-medium text-neutral-500 select-none">{label}</span>
			</div>
		</div>
	);
}
