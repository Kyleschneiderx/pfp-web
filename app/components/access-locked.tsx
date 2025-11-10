"use client";

import { IconLockAccess } from "@tabler/icons-react";

export type Props = {
	size?: "sm" | "md" | "lg" | "full"; // size presets
	rounded?: boolean;
	shadow?: boolean;
	blur?: "sm" | "md" | "lg" | "xl";
	dim?: "light" | "medium" | "dark";
	showLock?: boolean;
	title?: string;
	label?: React.ReactNode;
	subLabel?: React.ReactNode;
	onClick?: (e: React.MouseEvent) => void;
	className?: string;
};

const DIM_CLASSES = {
	light: "bg-white/20",
	medium: "bg-white/40",
	dark: "bg-white/60",
};

const SIZE_CLASSES = {
	sm: "w-32 h-20",
	md: "w-64 h-40",
	lg: "w-96 h-56",
	full: "w-full h-56",
};

const BLUR_CLASSES = {
	sm: "backdrop-blur-sm",
	md: "backdrop-blur",
	lg: "backdrop-blur-md",
	xl: "backdrop-blur-lg",
};

export default function AccessLocked({
	size = "full",
	rounded = true,
	shadow = true,
	blur = "sm",
	dim = "medium",
	showLock = true,
	label = "Restricted",
	subLabel = "This content is restricted. Please check your access level or contact an administrator.",
	title,
	onClick,
	className = "",
}: Props) {
	return (
		<div
			onClick={onClick}
			onKeyDown={undefined}
			className={`relative bg-white flex overflow-hidden ${SIZE_CLASSES[size]} ${
				rounded ? "rounded-lg" : ""
			} ${shadow ? "drop-shadow-center" : ""} ${className}`}
		>
			{title && <span className="text-xl p-5 font-bold w-full">{title}</span>}
			<div className="flex items-center justify-center">
				<div className={`absolute inset-0 flex items-center justify-center ${BLUR_CLASSES[blur]} ${DIM_CLASSES[dim]}`}>
					<div className="flex flex-col items-center justify-center space-y-1">
						<div className="flex items-center gap-2 text-neutral-800">
							{showLock && <IconLockAccess className="text-neutral-700" size={20} />}
							<span className="font-medium text-sm select-none">{label}</span>
						</div>
						<span className="font-sm text-sm text-center select-none max-w-[300px] text-neutral-700">{subLabel}</span>
					</div>
				</div>
			</div>
			<div className="invisible w-full h-full" />
		</div>
	);
}
