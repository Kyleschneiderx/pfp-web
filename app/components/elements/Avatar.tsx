import clsx from "clsx";
import { Avatar as RadixAvatar } from "radix-ui";

export default function Avatar({
	src,
	fallback,
	placeholder,
	className,
}: { src: string; fallback?: string; placeholder?: string; className?: string }) {
	return (
		<RadixAvatar.Root
			className={clsx(
				"h-full w-full overflow-hidden flex items-center justify-center border border-neutral-200 bg-primary-200 rounded-full",
				className,
			)}
		>
			<RadixAvatar.Image className="object-cover w-full h-full" src={src || placeholder} />
			{fallback && <RadixAvatar.Fallback className=" text-primary-600">{fallback}</RadixAvatar.Fallback>}
		</RadixAvatar.Root>
	);
}
