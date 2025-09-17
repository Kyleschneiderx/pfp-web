import {
	Calendar,
	type CalendarProps,
	Components,
	dateFnsLocalizer,
	type EventProps,
	type ToolbarProps,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./style.css";
import Button from "../Button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, ListIcon, RotateCcwIcon } from "lucide-react";
import ResponsiveActionMenu from "../ResponsiveActionMenu";
import { useState } from "react";

const locales = {
	"en-US": enUS,
};

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
});

type Event = {
	title: string;
	start: Date;
	end: Date;
	allDay?: boolean;
	resource?: any;
};

type BigCalendarOptions = {
	events: Event[];
	components?: Components;
} & Omit<CalendarProps, "localizer">;

const Toolbar = (toolbar: ToolbarProps) => {
	const [isMonth, setIsMonth] = useState<boolean>(toolbar.view === "month");
	return (
		<div className="flex items-center justify-between mb-2 text-neutral-900">
			<div className="flex flex-col space-y-1">
				<span>{toolbar.label}</span>
				<Button
					icon={isMonth ? <CalendarIcon className="w-4 h-4 mr-1" /> : <ListIcon className="w-4 h-4 mr-1" />}
					label={toolbar.view}
					className="text-white !py-1 !px-3 text-sm font-medium capitalize !rounded-full "
					title="View"
					onClick={() => {
						setIsMonth(!isMonth);
						toolbar.onView(isMonth ? "day" : "month");
					}}
				/>
			</div>

			<div className="flex flex-col">
				<div className="flex flex-row gap-x-5 ">
					<Button
						title="Previous"
						className="hover:text-neutral-500 active:text-neutral-900 !p-0"
						onClick={() => toolbar.onNavigate("PREV")}
					>
						<ChevronLeftIcon className="w-6 h-6" />
					</Button>
					<Button
						className="hover:text-neutral-500 active:text-neutral-900 !p-0 text-sm font-medium"
						title="Today"
						onClick={() => toolbar.onNavigate("TODAY")}
					>
						Today
					</Button>
					<Button
						title="Next"
						className="hover:text-neutral-500 active:text-neutral-900 !p-0"
						onClick={() => toolbar.onNavigate("NEXT")}
					>
						<ChevronRightIcon className="w-6 h-6" />
					</Button>
				</div>
			</div>
		</div>
	);
};

const BigCalendar = ({ events, components, ...props }: BigCalendarOptions) => {
	return (
		<div>
			<Calendar
				localizer={localizer}
				events={events}
				startAccessor="start"
				endAccessor="end"
				style={{ height: 600 }}
				step={5}
				timeslots={1}
				components={{
					toolbar: Toolbar,
					...components,
				}}
				popup
				popupOffset={{
					x: 5,
					y: 5,
				}}
				handleDragStart={() => {}}
				{...props}
			/>
		</div>
	);
};

export default BigCalendar;
