import type { OptionsModel } from "@/app/models/common_model";
import clsx from "clsx";
import Select from "react-select";
import type { MultiValue, Props as ReactSelectProps, SingleValue } from "react-select";

interface Props extends Omit<ReactSelectProps<OptionsModel>, "onChange"> {
	className?: string;
	wrapperClassName?: string;
	invalid?: boolean;
	onChange: (e: SingleValue<OptionsModel> | MultiValue<OptionsModel>) => void; // Custom handler for SingleValue
}

export default function SelectCmp({ className, wrapperClassName, invalid, onChange, ...rest }: Props) {
	return (
		<div className={clsx("relative z-20", wrapperClassName)}>
			<Select
				{...rest}
				classNamePrefix="react-select"
				className={clsx(
					"w-full rounded-md border p-[3px] focus:outline-none bg-white",
					invalid ? "border-error-400 focus:border-error-600" : "border-gray-200 focus:border-neutral-600 ",
					className,
				)}
				styles={{
					control: (provided) => ({
						...provided,
						border: "none",
						boxShadow: "none",
						padding: "0",
					}),
				}}
				onChange={(newValue, actionMeta) => {
					onChange(newValue);
				}}
			/>
		</div>
	);
}
