import clsx from "clsx";
import { Info } from "lucide-react";
import type { ComponentProps } from "react";
import { Tooltip as RadixTooltip } from "radix-ui";

type TooltipContentProps = ComponentProps<typeof RadixTooltip.Content>;

export default function Tooltip({
	side = "top",
	align = "center",
	content,
	children,
	className,
	delayDuration = 200,
}: {
	content?: React.ReactNode;
	side?: TooltipContentProps["side"];
	align?: TooltipContentProps["align"];
	children?: React.ReactNode;
	className?: string;
	delayDuration?: number;
}) {
	return (
		<RadixTooltip.Provider delayDuration={delayDuration}>
			<RadixTooltip.Root>
				<RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
				<RadixTooltip.Portal>
					<RadixTooltip.Content
						className={clsx(
							"z-[9999] max-w-xs rounded-md bg-neutral-900 px-2 py-1.5 text-xs text-white shadow-md outline-none",
							className,
						)}
						side={side}
						align={align}
						sideOffset={4}
					>
						{content}
					</RadixTooltip.Content>
				</RadixTooltip.Portal>
			</RadixTooltip.Root>
		</RadixTooltip.Provider>
	);
}
