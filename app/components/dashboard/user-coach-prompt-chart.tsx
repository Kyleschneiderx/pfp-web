"use client";

import { monthOptions } from "@/app/lib/months-options";
import { formatDate, getWeekRange } from "@/app/lib/utils";
import { yearOptions } from "@/app/lib/years-options";
import type { UserCoachPromptStatisticsModel } from "@/app/models/statistics_model";
import { getUserCoachPromptStatistics } from "@/app/services/client_side/stats";
import { BarElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Card from "../elements/Card";

ChartJS.register(BarElement, Tooltip, Legend);

function PeriodToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	return (
		<div className="flex items-center bg-neutral-100 rounded-md p-0.5 gap-0.5">
			{["monthly", "weekly"].map((opt) => (
				<button
					key={opt}
					type="button"
					onClick={() => onChange(opt)}
					className={clsx(
						"px-3 py-1 text-xs font-medium rounded transition-colors duration-200",
						value === opt ? "bg-white text-neutral-900 drop-shadow-center" : "text-neutral-500 hover:text-neutral-700",
					)}
				>
					{opt.charAt(0).toUpperCase() + opt.slice(1)}
				</button>
			))}
		</div>
	);
}

function WeekNav({ start, end, onPrev, onNext }: { start: Date; end: Date; onPrev: () => void; onNext: () => void }) {
	const fmt = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

	return (
		<div className="flex items-center gap-1 text-xs font-medium text-neutral-600">
			<button type="button" onClick={onPrev} className="p-0.5 hover:text-neutral-900 transition-colors">
				<ChevronLeft size={14} />
			</button>
			<span className="whitespace-nowrap">
				{fmt(start)} – {fmt(end)}
			</span>
			<button type="button" onClick={onNext} className="p-0.5 hover:text-neutral-900 transition-colors">
				<ChevronRight size={14} />
			</button>
		</div>
	);
}

export default function UserCoachPromptChart() {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth();

	const [period, setPeriod] = useState("monthly");
	const [selectedYear, setSelectedYear] = useState(currentYear.toString());
	const [selectedMonth, setSelectedMonth] = useState((currentMonth + 1).toString().padStart(2, "0"));
	const [currentDate, setCurrentDate] = useState(new Date());
	const [weekStart, setWeekStart] = useState(getWeekRange(new Date()).startOfWeek);
	const [weekEnd, setWeekEnd] = useState(getWeekRange(new Date()).endOfWeek);
	const [stats, setStats] = useState<UserCoachPromptStatisticsModel | undefined>();

	const shiftWeek = (dir: 1 | -1) => {
		const d = new Date(currentDate);
		d.setDate(d.getDate() + dir * 7);
		setCurrentDate(d);
		setWeekStart(getWeekRange(d).startOfWeek);
		setWeekEnd(getWeekRange(d).endOfWeek);
	};

	const fetchStats = async () => {
		let dateFrom: string;
		let dateTo: string;

		if (period === "weekly") {
			dateFrom = formatDate(weekStart);
			dateTo = formatDate(weekEnd);
		} else {
			const lastDay = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
			dateFrom = `${selectedYear}-${selectedMonth}-01`;
			dateTo = `${selectedYear}-${selectedMonth}-${lastDay}`;
		}

		const response = await getUserCoachPromptStatistics(`period=${period}&date_from=${dateFrom}&date_to=${dateTo}`);
		setStats(response);
	};

	useEffect(() => {
		fetchStats();
	}, [period, selectedYear, selectedMonth, weekStart]);

	const chartData = {
		labels: stats ? Object.keys(stats.stats) : [],
		datasets: [
			{
				data: stats ? Object.values(stats.stats) : [],
				backgroundColor: "#736CED",
				borderWidth: 0,
				borderRadius: 3,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: { display: false },
			tooltip: {
				enabled: true,
				backgroundColor: "black",
				callbacks: {
					// biome-ignore lint/suspicious/noExplicitAny: chart.js callback type
					label: (context: any) => `${context.formattedValue}`,
				},
			},
		},
	};

	return (
		<Card>
			{/* Row 1: title + total chip + toggle at end */}
			<div className="flex items-center justify-between gap-3 mb-3">
				<div className="flex items-center gap-2.5 min-w-0">
					<span className="text-sm font-semibold text-neutral-900 truncate">AI Coach Prompts</span>
					<span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full shrink-0">
						{stats?.total ?? 0} total
					</span>
				</div>
				<PeriodToggle value={period} onChange={setPeriod} />
			</div>

			{/* Row 2: date selector — centered, more prominent */}
			<div className="flex justify-center mb-4 min-h-[32px] items-center gap-2">
				{period === "weekly" ? (
					<WeekNav start={weekStart} end={weekEnd} onPrev={() => shiftWeek(-1)} onNext={() => shiftWeek(1)} />
				) : (
					<>
						<select
							value={selectedMonth}
							onChange={(e) => setSelectedMonth(e.target.value)}
							className="text-xs font-medium border border-neutral-200 bg-white rounded-md px-3 py-1.5 text-neutral-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
						>
							{monthOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
						<select
							value={selectedYear}
							onChange={(e) => setSelectedYear(e.target.value)}
							className="text-xs font-medium border border-neutral-200 bg-white rounded-md px-3 py-1.5 text-neutral-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
						>
							{yearOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</>
				)}
			</div>

			<div className="mb-1">
				<Bar data={chartData} options={chartOptions} />
			</div>
		</Card>
	);
}
