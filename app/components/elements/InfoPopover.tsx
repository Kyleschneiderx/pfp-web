import clsx from "clsx";
import { Info } from "lucide-react";
import { Popover } from "radix-ui";

export default function InfoPopover({
	side = "left",
	align = "start",
	content,
	children,
	className,
}: {
	content?: React.ReactNode;
	side?: Popover.PopoverContentProps["side"];
	align?: Popover.PopoverContentProps["align"];
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<div className="h-5 w-5 p-0 hover:bg-neutral-100 cursor-pointer">
					<Info className="h-4 w-4 text-neutral-500" />
				</div>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					className={clsx("w-80 z-[9999] outline-none rounded-md drop-shadow-center bg-white p-5", className)}
					side={side}
					align={align}
				>
					{children ?? content}
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
