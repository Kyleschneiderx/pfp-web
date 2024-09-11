import clsx from "clsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  className?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  dateFormat?: string;
  maxDate?: Date;
  invalid?: boolean;
}

export default function DateInput({
  className,
  selected,
  onChange,
  dateFormat = "MM/dd/yyyy",
  placeholderText = "mm/dd/yyyy",
  maxDate,
  invalid,
  ...rest
}: Props) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      className={clsx(
        "w-full rounded-md border py-[10px] pl-4 placeholder:text-neutral-400 placeholder:font-light focus:outline-none",
        invalid
          ? "border-error-400 focus:border-error-600 bg-error-25"
          : "border-gray-200 focus:border-neutral-600 ",
        className
      )}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      dateFormat={dateFormat}
      placeholderText={placeholderText}
      maxDate={maxDate}
      {...rest}
    />
  );
}
