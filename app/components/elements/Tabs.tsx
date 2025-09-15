import * as TabsPrimitive from "@radix-ui/react-tabs";
import clsx from "clsx";
import { forwardRef } from "react";

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ children, className, ...props }, ref) => {
	return (
		<TabsPrimitive.List
			ref={ref}
			className={clsx("flex gap-x-1 border-b-[1px] border-neutral-300", className)}
			{...props}
		>
			{children}
		</TabsPrimitive.List>
	);
});

export const TabsTrigger = forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ children, className, ...props }, ref) => {
	return (
		<TabsPrimitive.Trigger
			ref={ref}
			className={clsx(
				"hover:text-primary-500 rounded-lg relative mb-[7px] text-base",
				"before:content-[''] before:absolute before:opacity-0 before:pointer-events-none before:w-full before:h-[3px] before:mb-[1px] before:left-0 before:right-0 before:-bottom-[9px]",
				"data-[state=active]:text-primary-500 p-3 data-[state=active]:bg-primary-100 data-[state=active]:before:bg-primary-500 data-[state=active]:before:opacity-100",
				className,
			)}
			{...props}
		>
			<span className="">{children}</span>
		</TabsPrimitive.Trigger>
	);
});

export const TabsContent = forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ children, className, ...props }, ref) => {
	return (
		<TabsPrimitive.Content ref={ref} className={clsx("", className)} {...props}>
			{children}
		</TabsPrimitive.Content>
	);
});
