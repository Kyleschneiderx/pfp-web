import { OptionsModel } from "@/app/models/common_model";
import clsx from "clsx";
import Select, { Props as ReactSelectProps, SingleValue } from "react-select";

interface Props extends Omit<ReactSelectProps<OptionsModel>, "onChange"> {
  className?: string;
  wrapperClassName?: string;
  invalid?: boolean;
  onChange: (e: SingleValue<OptionsModel>) => void; // Custom handler for SingleValue
}

export default function SelectCmp({
  className,
  wrapperClassName,
  invalid,
  onChange,
  ...rest
}: Props) {
  return (
    <div className={clsx("relative z-20", wrapperClassName)}>
      <Select
        {...rest}
        classNamePrefix="react-select"
        className={clsx(
          "w-full rounded-md border p-[3px] focus:outline-none bg-white",
          invalid
            ? "border-error-400 focus:border-error-600"
            : "border-gray-200 focus:border-neutral-600 ",
          className
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
          // If it's a single value, call the provided onChange handler
          if (!Array.isArray(newValue)) {
            onChange(newValue as SingleValue<OptionsModel>);
          }
        }}
      />
    </div>
  );
}
