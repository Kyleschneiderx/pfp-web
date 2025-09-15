import clsx from "clsx";

interface Props {
	label?: string;
	className?: string;
	children?: React.ReactNode;
}

export default function Badge({ label, className, children }: Props) {
	return (
		<span className={clsx("mr-3 bg-neutral-200 py-[5px] px-[10px] text-xs font-medium rounded-full", className)}>
			{children ?? label ?? ""}
		</span>
	);
}
