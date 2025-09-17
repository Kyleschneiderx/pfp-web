import clsx from "clsx";
import Async, { type AsyncProps } from "react-select/async";
import type { GroupBase, MultiValue, SingleValue } from "react-select";
import { useState } from "react";

type CustomOption = {
	label: string;
	value: string | number | null;
};

type OnChangeValue<IsMulti extends boolean> = IsMulti extends true
	? (value: CustomOption["value"][]) => void
	: (value: CustomOption["value"]) => void;

interface Props<
	Option extends CustomOption,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>,
> extends Omit<AsyncProps<Option, IsMulti, Group>, "onChange"> {
	className?: string;
	wrapperClassName?: string;
	invalid?: boolean;
	onChange: OnChangeValue<IsMulti>; // Custom handler for SingleValue
}

export default function AsyncSelectCmp<
	Option extends CustomOption,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>,
>({ className, wrapperClassName, invalid, onChange, ...rest }: Props<Option, IsMulti, Group>) {
	const [selectedOption, setSelectedOption] = useState<SingleValue<Option> | MultiValue<Option>>();

	const handleChangeValue = (option: SingleValue<Option> | MultiValue<Option>) => {
		setSelectedOption(option);

		if (!option) {
			onChange(null as any);
			return;
		}

		if (Array.isArray(option)) {
			const values = option.map((o) => o.value);
			(onChange as OnChangeValue<true>)(values);
		} else {
			(onChange as OnChangeValue<false>)((option as Option).value);
		}
	};

	return (
		<div className={clsx("relative z-20", wrapperClassName)}>
			<Async
				{...rest}
				classNamePrefix="react-select"
				className={clsx(
					"w-full rounded-md border p-[3px] focus:outline-none bg-white",
					invalid ? "border-error-400 focus:border-error-600" : "border-gray-200 focus:border-neutral-600 ",
					className,
				)}
				value={selectedOption}
				styles={{
					control: (provided) => ({
						...provided,
						border: "none",
						boxShadow: "none",
						padding: "0",
					}),
				}}
				onChange={(newValue, actionMeta) => {
					handleChangeValue(newValue);
				}}
			/>
		</div>
	);
}
