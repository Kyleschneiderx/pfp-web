"use client";

import { EllipsisVerticalIcon, PencilIcon, Trash2Icon, X } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "./DropdownMenu";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
} from "@radix-ui/react-dialog";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useWindowSizeCheck } from "@/app/hooks/useWindowSizeCheck";
import clsx from "clsx";

type Actions = {
	label: string;
	onClick: () => void;
	icon?: React.ReactNode;
	className?: string;
};

type Align = "end" | "center" | "start" | undefined;

type Side = "top" | "right" | "bottom" | "left" | undefined;

type ActionMenuProps = {
	title?: string;
	onEdit?: () => void;
	onDelete?: () => void;
	customActions?: Actions[];
	content?: () => React.ReactNode;
	icon?: React.ReactNode;
	align?: Align;
	side?: Side;
	zIndex?: number;
	editIcon?: React.ReactNode;
	deleteIcon?: React.ReactNode;
	showEditIcon?: boolean;
	showDeleteIcon?: boolean;
	className?: string;
};

const ResponsiveActionMenu = ({
	title,
	onEdit,
	onDelete,
	customActions,
	content,
	icon,
	align = "end",
	side = "bottom",
	zIndex = 99,
	editIcon = <PencilIcon className="h-4 w-4" />,
	deleteIcon = <Trash2Icon className="h-4 w-4" />,
	showEditIcon = true,
	showDeleteIcon = true,
	className,
}: ActionMenuProps) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { isMobile } = useWindowSizeCheck();

	const onOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			requestAnimationFrame(() => {
				(document.activeElement as HTMLElement)?.blur();
			});
		}
		document.body.style.pointerEvents = "auto";
	};

	return isMobile ? (
		<div className={className}>
			<Dialog open={isOpen} onOpenChange={onOpenChange}>
				<DialogTrigger onClick={() => setIsOpen((prev) => !prev)} asChild data-aria-hidden="true">
					{icon ?? <EllipsisVerticalIcon size={21} className="text-neutral-900 cursor-pointer" />}
				</DialogTrigger>
				<DialogPortal>
					<DialogOverlay className={`fixed inset-0 sm:hidden bg-black/50 z-[${zIndex}]`} />
					<DialogContent
						onFocusOutside={() => setIsOpen((prev) => !prev)}
						className={`
              fixed bottom-0 sm:hidden z-[${zIndex}] left-0 w-full bg-white rounded-t-2xl shadow-lg
              data-[state=open]:animate-slide-up data-[state=closed]:animate-slide-down`}
					>
						<VisuallyHidden>
							<DialogDescription>Drawer Menu Description</DialogDescription>
						</VisuallyHidden>
						<div className="flex flex-row px-5 pt-2 justify-center items-center">
							<div className="flex-grow text-center text-xl font-semibold text-neutral-900 px-4 pt-4">
								{title ? (
									<DialogTitle>{title}</DialogTitle>
								) : (
									<VisuallyHidden>
										<DialogTitle>Drawer Menu</DialogTitle>
									</VisuallyHidden>
								)}
							</div>
						</div>

						{!content && (
							<div className="flex flex-col mt-2 mb-4 text-md font-semibold text-neutral-900">
								{onEdit && (
									<button
										type="button"
										onClick={onEdit}
										className="block w-full text-left px-6 py-2 hover:text-neutral-900/70"
									>
										<span className="flex flex-row items-center gap-x-2">
											{showEditIcon && editIcon}
											<span>Edit</span>
										</span>
									</button>
								)}
								{customActions?.map((action) => {
									return (
										<button
											key={`action-${action.label}`}
											type="button"
											onClick={action.onClick}
											className={clsx("block w-full text-left px-6 py-2 hover:text-neutral-900/70", action?.className)}
										>
											<span className="flex flex-row items-center gap-x-2">
												{action.icon}
												<span>{action.label}</span>
											</span>
										</button>
									);
								})}
								{onDelete && (
									<button
										type="button"
										onClick={onDelete}
										className="block w-full text-left px-6 py-2 text-error-500 hover:text-error-500/70"
									>
										<span className="flex flex-row items-center gap-x-2">
											{showDeleteIcon && deleteIcon}
											<span>Delete</span>
										</span>
									</button>
								)}
							</div>
						)}
						{content?.()}
					</DialogContent>
				</DialogPortal>
			</Dialog>
		</div>
	) : (
		<div className={className}>
			<DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
				<DropdownMenuTrigger onClick={() => setIsOpen((prev) => !prev)} asChild data-aria-hidden="true">
					{icon ?? <EllipsisVerticalIcon size={21} className="text-neutral-900 cursor-pointer" />}
				</DropdownMenuTrigger>
				<DropdownMenuPortal>
					<DropdownMenuContent align={align} side={side} className={`mt-3 z-[${zIndex}]`}>
						{onEdit && (
							<DropdownMenuItem onClick={onEdit}>
								<div className="flex flex-row items-center gap-x-2">
									{showEditIcon && editIcon}
									Edit
								</div>
							</DropdownMenuItem>
						)}
						{customActions?.map((action) => {
							return (
								<DropdownMenuItem key={`action-${action.label}`} onClick={action.onClick} className={action?.className}>
									<div className="flex flex-row items-center gap-x-2">
										{action.icon}
										{action.label}
									</div>
								</DropdownMenuItem>
							);
						})}
						{onDelete && (
							<DropdownMenuItem onClick={onDelete} className="!text-error-500">
								<div className="flex flex-row items-center gap-x-2">
									{showDeleteIcon && deleteIcon}
									Delete
								</div>
							</DropdownMenuItem>
						)}
						{content?.()}
					</DropdownMenuContent>
				</DropdownMenuPortal>
			</DropdownMenu>
		</div>
	);
};

export default ResponsiveActionMenu;
