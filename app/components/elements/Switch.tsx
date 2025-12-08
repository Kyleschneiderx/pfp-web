import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

interface Props {
	checkedLabel?: string;
	unCheckedLabel?: string;
	onCheckedChange?: (checked: boolean) => void;
	className?: string;
	checked?: boolean;
}

export default function Switch({ className, onCheckedChange, checkedLabel, unCheckedLabel, checked = false }: Props) {
	const [isCheck, setIsCheck] = useState<boolean>(checked);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.checked;
		setIsCheck(value);
		onCheckedChange?.(value);
	};

	useEffect(() => {
		setIsCheck(checked);
	}, [checked]);

	return (
		<label className={clsx("relative inline-flex items-center cursor-pointer select-none", className)}>
			<input type="checkbox" checked={isCheck} onChange={handleChange} className="sr-only peer" />
			<div
				className={clsx(
					"w-10 h-5 rounded-full transition-colors duration-300",
					isCheck ? "bg-primary-500" : "bg-gray-300",
				)}
			/>
			<span
				className={clsx(
					"absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300",
					isCheck ? "translate-x-5" : "translate-x-0",
				)}
			/>
			<span className="ml-3 text-xs font-medium">{isCheck ? checkedLabel : unCheckedLabel}</span>
		</label>
	);
}
