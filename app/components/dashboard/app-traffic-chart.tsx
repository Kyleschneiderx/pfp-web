import { BarElement, Chart as ChartJS, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import Card from "../elements/Card";
import type { UserVisitStatsModel } from "@/app/models/user_visit_stats";
import { capitalizeFirstLetter, formatDate, getWeekRange } from "@/app/lib/utils";
import SelectCmp from "../elements/SelectCmp";
import { useEffect, useState } from "react";
import type { OptionsModel } from "@/app/models/common_model";
import { yearOptions } from "@/app/lib/years-options";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getUserVisitStats } from "@/app/services/client_side/patients";
import { monthOptions } from "@/app/lib/months-options";

ChartJS.register(BarElement, Tooltip, Legend);

export default function AppTrafficChart() {
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const [userVisitStats, setUserVisitStats] = useState<UserVisitStatsModel | null>(null);
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth();
	const [selectedOption1, setSelectedOption1] = useState<OptionsModel | null>({
		label: "Monthly",
		value: "monthly",
	});
	const [selectedYear, setSelectedYear] = useState<OptionsModel | null>({
		label: currentYear.toString(),
		value: currentYear.toString(),
	});
	const [selectedMonth, setSelectedMonth] = useState<OptionsModel | null>(
		monthOptions.find((opt) => opt.value === (currentMonth + 1).toString().padStart(2, "0")) as OptionsModel,
	);
	const [startOfWeek, setStartOfWeek] = useState<Date>(getWeekRange(currentDate).startOfWeek);
	const [endOfWeek, setEndOfWeek] = useState<Date>(getWeekRange(currentDate).endOfWeek);

	const goToPreviousWeek = () => {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() - 7);
		setStartOfWeek(getWeekRange(newDate).startOfWeek);
		setEndOfWeek(getWeekRange(newDate).endOfWeek);
		setCurrentDate(newDate);
	};

	const goToNextWeek = () => {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + 7);
		setStartOfWeek(getWeekRange(newDate).startOfWeek);
		setEndOfWeek(getWeekRange(newDate).endOfWeek);
		setCurrentDate(newDate);
	};

	const formatDate1 = (date: Date): string => {
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const options1: OptionsModel[] = [
		{ label: "Monthly", value: "monthly" },
		{ label: "Weekly", value: "weekly" },
	];

	const handleSelect1Change = (data: OptionsModel | null) => {
		setSelectedOption1(data);
	};

	const handleYearChange = (data: OptionsModel | null) => {
		setSelectedYear(data);
	};

	const handleMonthChange = (data: OptionsModel | null) => {
		setSelectedMonth(data);
	};

	const chartData = {
		labels: userVisitStats?.pages.map((page) => capitalizeFirstLetter(page.label.toLowerCase())),
		datasets: [
			{
				data: userVisitStats?.pages.map((page) => page.percentage),
				backgroundColor: "#736CED",
				borderWidth: 0,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		// cutout: "80%",
		// aspectRatio: 1.4,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: true,
				backgroundColor: "black",
				callbacks: {
					label: (context: any) => {
						return `${context.formattedValue}%`;
					},
				},
			},
		},
	};

	const fetchAppTraffic = async () => {
		let dateFrom = `${selectedYear?.value}-${selectedMonth?.value}-01`;
		const lastDate =
			selectedYear?.value && selectedMonth?.value
				? new Date(Number(selectedYear.value), Number(selectedMonth?.value), 0).getDate()
				: new Date().getDate();
		let dateTo = `${selectedYear?.value}-${selectedMonth?.value}-${lastDate}`;

		if (selectedOption1?.value === "weekly") {
			dateFrom = formatDate(startOfWeek);
			dateTo = formatDate(endOfWeek);
		}

		const params = `period=${selectedOption1?.value}&date_from=${dateFrom}&date_to=${dateTo}`;

		const response = await getUserVisitStats(params);
		setUserVisitStats(response);
	};

	useEffect(() => {
		fetchAppTraffic();
	}, [selectedOption1, selectedYear, startOfWeek, selectedMonth]);

	return (
		<div className="xl:w-2/5 w-full mb-5">
			<Card className="xl:mr-5 h-full">
				{/* <div className="flex flex-col items-center justify-center"> */}
				<div className="flex flex-wrap flex-col sm:flex-row">
					{/* <div className="flex flex-col mr-5">
							<span className="text-xl font-bold">App Traffic</span>
							<span className="text-md text-neutral-600">User journey through key app sections</span>
						</div> */}
					<div className="flex flex-col">
						<span className="text-[28px] font-bold">{userVisitStats?.total ?? 0}</span>
						<span className=" text-neutral-600">Total Devices</span>
					</div>
					<div className="ml-0 sm:ml-auto">
						<div className="sm:flex ml-0 sm:space-x-3 sm:ml-auto w-full sm:w-auto mt-5 sm:mt-0">
							<SelectCmp
								options={options1}
								value={selectedOption1}
								onChange={(e) => handleSelect1Change(e as OptionsModel)}
								className="p-0 mb-2"
								wrapperClassName="z-[999]"
							/>
						</div>
					</div>
				</div>
				{/* </div> */}
				{selectedOption1?.value === "monthly" && (
					<div className="flex flex-row justify-center items-center space-x-2 mt-3">
						<SelectCmp
							options={monthOptions}
							value={selectedMonth}
							onChange={(e) => handleMonthChange(e as OptionsModel)}
							placeholder="Select"
							className="p-0"
							wrapperClassName="!w-full"
						/>
						<SelectCmp
							options={yearOptions}
							value={selectedYear}
							onChange={(e) => handleYearChange(e as OptionsModel)}
							placeholder="Select"
							className="p-0"
							wrapperClassName="!w-full"
						/>
					</div>
				)}
				{selectedOption1?.value === "weekly" && (
					<div className="flex items-center justify-center font-medium text-sm space-x-2 mt-3">
						<ChevronLeft className="cursor-pointer" onClick={goToPreviousWeek} />
						<span>
							{formatDate1(startOfWeek)} - {formatDate1(endOfWeek)}
						</span>
						<ChevronRight className="cursor-pointer" onClick={goToNextWeek} />
					</div>
				)}
				<div className="relative m-auto mt-6">
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Card>
		</div>
	);
}
