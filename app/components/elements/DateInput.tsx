import clsx from "clsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  className?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  dateFormat?: string;
}

export default function DateInput({
  className,
  selected,
  onChange,
  dateFormat = "MM/dd/yyyy",
  placeholderText = "mm/dd/yyyy",
  ...rest
}: Props) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      className={clsx(
        "w-full rounded-md border border-gray-200 py-[10px] pl-4 placeholder:text-neutral-400 placeholder:font-light focus:border-neutral-600 focus:outline-none",
        className
      )}
      dateFormat={dateFormat}
      placeholderText={placeholderText}
      {...rest}
    />
  );
}
