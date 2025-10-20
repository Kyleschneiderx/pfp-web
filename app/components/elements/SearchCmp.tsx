"use client";

import Input from "@/app/components/elements/Input";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface Prop {
	placeholder: string;
	className?: string;
	onChange?: (text: string) => void;
	value?: string;
	param?: string;
}

export default function SearchCmp({ placeholder, className, onChange, value, param = "name" }: Prop) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { replace } = useRouter();

	const handleSearch = useDebouncedCallback((term: string) => {
		if (onChange) {
			onChange(term);
		} else {
			const params = new URLSearchParams(searchParams);
			if (term) {
				params.set(param, term);
			} else {
				params.delete(param);
			}
			replace(`${pathname}?${params.toString()}`);
		}
	}, 300);

	return (
		<div className={clsx("w-[540px]", className)}>
			<Input
				id="search"
				type="text"
				name="search"
				placeholder={placeholder}
				icon="Search"
				onChange={(e) => handleSearch(e.target.value)}
				defaultValue={value ?? searchParams.get(param)?.toString()}
			/>
		</div>
	);
}
