import type { OptionsModel } from "@/app/models/common_model";
import clsx from "clsx";
import Select from "react-select";
import type { OnChangeValue, Props as ReactSelectProps } from "react-select";

interface Props<IsMulti extends boolean = false> extends Omit<ReactSelectProps<OptionsModel>, "onChange"> {
	className?: string;
	isMulti?: IsMulti;
	wrapperClassName?: string;
	invalid?: boolean;
	onChange: (e: OnChangeValue<OptionsModel, IsMulti>) => void; // Custom handler for SingleValue
}

export default function SelectCmp<IsMulti extends boolean = false>({
	className,
	wrapperClassName,
	invalid,
	onChange,
	...rest
}: Props<IsMulti>) {
	return (
		<div className={clsx("relative z-20", wrapperClassName)}>
			<Select<OptionsModel, IsMulti>
				{...(rest as ReactSelectProps<OptionsModel, IsMulti>)}
				classNamePrefix="react-select"
				className={clsx(
					"w-full rounded-md border p-[3px] focus:outline-none bg-white",
					invalid ? "border-error-400 focus:border-error-600" : "border-gray-200 focus:border-neutral-600 ",
					className,
				)}
				menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
				styles={{
					control: (provided) => ({
						...provided,
						border: "none",
						boxShadow: "none",
						padding: "0",
					}),
					menuPortal: (base) => ({
						...base,
						zIndex: 9999,
					}),
				}}
				onChange={(newValue) => {
					onChange(newValue ?? (null as OnChangeValue<OptionsModel, IsMulti>));
				}}
			/>
		</div>
	);
}
