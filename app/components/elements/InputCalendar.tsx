import clsx from "clsx";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, Search } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
	placeholder?: string;
	timeOnly?: boolean;
	dateOnly?: boolean;
	className?: string;
	timeFormat?: string;
	dateFormat?: string;
	value?: string | Date;
	showIcon?: boolean;
	onChange: (date: string) => void;
}

const CustomInput = forwardRef(({ value, onClick }: any, ref) => (
	<button onClick={onClick} type="button" ref={ref as any} className="flex items-center border px-3 py-2 rounded-lg">
		<ClockIcon className="mr-2 text-primary-500" />
		<span>{value || "Select time"}</span>
	</button>
));

const InputCalendar = ({
	placeholder = "Select Date",
	timeFormat = "HH:mm:ss",
	dateFormat = "yyyy-MM-dd",
	onChange,
	className,
	timeOnly,
	dateOnly,
	showIcon,
	value,
	...rest
}: Props) => {
	const inputFormat = !timeOnly && !dateOnly ? `${dateFormat} ${timeFormat}` : dateOnly ? dateFormat : timeFormat;

	const [date, setDate] = useState<Date | null>(value ? new Date(value) : null);

	useEffect(() => {
		setDate(date ? new Date(date) : null);
	}, [value]);

	const handleOnChange = (date: Date | null) => {
		setDate(date);
		if (onChange) onChange(date ? format(date, inputFormat as string) : "");
	};

	return (
		<div className="relative w-full">
			<DatePicker
				className={clsx("rounded text-neutral-900 text-sm py-1 pl-8 pr-2 border z-20 items-center", className)}
				wrapperClassName="w-full relative"
				selected={date}
				timeIntervals={15} // step in minutes
				onChange={handleOnChange}
				placeholderText={placeholder}
				dateFormat={inputFormat}
				timeFormat={timeFormat}
				showTimeSelect={(timeOnly ?? false) || (!timeOnly && !dateOnly)}
				showTimeSelectOnly={timeOnly}
				calendarClassName="bg-primary-500"
				renderCustomHeader={({ date, changeMonth }) => (
					<div className="flex justify-between items-center px-4 bg-primary-200">
						<button
							type="button"
							onClick={() => changeMonth(date.getMonth() - 1)}
							className="text-neutral-900/70 hover:text-neutral-900"
						>
							<ChevronLeftIcon size={18} />
						</button>
						<span className="text-base font-bold text-neutral-900">
							{date.toLocaleString("default", {
								month: "long",
								year: "numeric",
							})}
						</span>
						<button
							type="button"
							onClick={() => changeMonth(date.getMonth() + 1)}
							className="text-neutral-900/70 hover:text-neutral-900"
						>
							<ChevronRightIcon size={18} />
						</button>
					</div>
				)}
				{...rest}
			/>

			{showIcon && (
				<CalendarIcon className="absolute w-5 left-2 top-1/2 transform -translate-y-1/2 text-primary-300/70" />
			)}
		</div>
	);
};

export default InputCalendar;
