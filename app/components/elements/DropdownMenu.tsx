import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { forwardRef } from "react";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuContent = forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ children, className, ...props }, ref) => {
	return (
		<>
			<DropdownMenuPrimitive.Content
				ref={ref}
				className={clsx("drop-shadow-center bg-white text-neutral-900 p-1 z-10 min-w-[150px] rounded-md", className)}
				{...props}
			>
				{children}
			</DropdownMenuPrimitive.Content>
		</>
	);
});

export const DropdownMenuItem = forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ children, className, ...props }, ref) => {
	return (
		<DropdownMenuPrimitive.Item
			ref={ref}
			className={clsx(
				"cursor-pointer p-2 bg-white flex text-sm text-neutral-700 outline-none hover:bg-primary-100",
				className,
			)}
			{...props}
		>
			{children}
		</DropdownMenuPrimitive.Item>
	);
});
