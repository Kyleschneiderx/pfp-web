"use client";

import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	format,
	isBefore,
	isSameDay,
	isSameMonth,
	startOfDay,
	startOfMonth,
	startOfWeek,
	endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

interface CalendarProps {
	month: Date;
	onMonthChange: (next: Date) => void;
	selected: Date | null;
	onSelect: (day: Date) => void;
	isDayAvailable: (day: Date) => boolean;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar({
	month,
	onMonthChange,
	selected,
	onSelect,
	isDayAvailable,
}: CalendarProps) {
	const today = startOfDay(new Date());

	const days = useMemo(() => {
		const gridStart = startOfWeek(startOfMonth(month));
		const gridEnd = endOfWeek(endOfMonth(month));
		return eachDayOfInterval({ start: gridStart, end: gridEnd });
	}, [month]);

	const canGoBack = !isSameMonth(month, today) && !isBefore(month, today);

	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-lg font-bold text-neutral-900">
					{format(month, "MMMM yyyy")}
				</h3>
				<div className="flex items-center gap-1">
					<button
						type="button"
						aria-label="Previous month"
						disabled={!canGoBack}
						onClick={() => onMonthChange(addMonths(month, -1))}
						className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 transition hover:bg-primary-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						aria-label="Next month"
						onClick={() => onMonthChange(addMonths(month, 1))}
						className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 transition hover:bg-primary-50 hover:text-primary-600"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				</div>
			</div>

			<div className="mb-2 grid grid-cols-7 gap-1">
				{WEEKDAYS.map((d, i) => (
					<div
						key={`${d}-${i}`}
						className="py-1 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400"
					>
						{d}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7 gap-1">
				{days.map((day) => {
					const inMonth = isSameMonth(day, month);
					const isPast = isBefore(day, today);
					const available = inMonth && !isPast && isDayAvailable(day);
					const isSelected = selected && isSameDay(day, selected);
					const isToday = isSameDay(day, today);

					return (
						<button
							key={day.toISOString()}
							type="button"
							disabled={!available}
							onClick={() => onSelect(day)}
							className={[
								"relative flex aspect-square items-center justify-center rounded-md text-sm transition",
								!inMonth ? "text-neutral-300" : "",
								isSelected
									? "bg-primary-500 font-semibold text-white"
									: available
										? "font-medium text-neutral-800 hover:bg-primary-50"
										: "cursor-not-allowed text-neutral-300",
							].join(" ")}
						>
							{isToday && !isSelected && (
								<span className="absolute inset-0 rounded-md ring-1 ring-inset ring-primary-300" />
							)}
							{format(day, "d")}
							{available && !isSelected && (
								<span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-success-500" />
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
