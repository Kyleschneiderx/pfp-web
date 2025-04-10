"use client";

import UserDoughnutChart from "@/app/components/dashboard/user-doughnut-chart";
import UserLineChart from "@/app/components/dashboard/user-line-chart";
import AppTrafficChart from "@/app/components/dashboard/app-traffic-chart";
import Card from "@/app/components/elements/Card";
import { formatDate, getWeekRange } from "@/app/lib/utils";
import { yearOptions } from "@/app/lib/years-options";
import { OptionsModel } from "@/app/models/common_model";
import { UserSummaryModel } from "@/app/models/user_summary_model";
import { getUserSummary, getUserVisitStats } from "@/app/services/client_side/patients";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { UserVisitStatsModel } from "@/app/models/user_visit_stats";

const SelectCmp = dynamic(() => import("@/app/components/elements/SelectCmp"), {
	ssr: false,
});

const formatDate1 = (date: Date): string => {
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

export default function Page() {
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const currentYear = new Date().getFullYear();
	const [selectedOption1, setSelectedOption1] = useState<OptionsModel | null>({
		label: "Monthly",
		value: "monthly",
	});
	const [selectedYear, setSelectedYear] = useState<OptionsModel | null>({
		label: currentYear.toString(),
		value: currentYear.toString(),
	});
	const [userSummary, setUserSummary] = useState<UserSummaryModel | null>(null);
	const [userVisitStats, setUserVisitStats] = useState<UserVisitStatsModel | null>(null);
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

	const fetchUserSummary = async () => {
		let dateFrom = `${selectedYear?.value}-01-01`;
		let dateTo = `${selectedYear?.value}-12-01`;

		if (selectedOption1?.value === "weekly") {
			dateFrom = formatDate(startOfWeek);
			dateTo = formatDate(endOfWeek);
		}

		const params = `period=${selectedOption1?.value}&date_from=${dateFrom}&date_to=${dateTo}`;
		const response = await getUserSummary(params);
		setUserSummary(response);
	};

	const fetchAppTraffic = async () => {
		const response = await getUserVisitStats();
		setUserVisitStats(response);
	};

	useEffect(() => {
		fetchUserSummary();
	}, [selectedOption1, selectedYear, startOfWeek]);

	useEffect(() => {
		fetchAppTraffic();
	}, []);

	return (
		<div className="flex flex-wrap">
			<div className="xl:w-2/5 w-full mb-5">
				<Card className="xl:mr-5">
					<div className="flex flex-col sm:flex-row items-start">
						<div>
							<p className="text-[28px] font-bold">{userSummary?.total_users ?? "0"}</p>
							<p className="text-neutral-600">Total Users</p>
						</div>
						<div className="sm:flex ml-0 sm:space-x-3 sm:ml-auto w-full sm:w-auto mt-5 sm:mt-0">
							<SelectCmp
								options={options1}
								value={selectedOption1}
								onChange={(e) => handleSelect1Change(e as OptionsModel)}
								className="p-0 mb-2"
								wrapperClassName="z-[999]"
							/>
							{selectedOption1?.value === "monthly" && (
								<SelectCmp
									options={yearOptions}
									value={selectedYear}
									onChange={(e) => handleYearChange(e as OptionsModel)}
									placeholder="Select"
									className="p-0"
									wrapperClassName="w-[110px] ml-0 sm:ml-auto w-full sm:w-auto"
								/>
							)}
						</div>
					</div>
					{selectedOption1?.value === "weekly" && (
						<div className="flex items-center justify-center font-medium text-sm space-x-2 mt-3">
							<ChevronLeft className="cursor-pointer" onClick={goToPreviousWeek} />
							<span>
								{formatDate1(startOfWeek)} - {formatDate1(endOfWeek)}
							</span>
							<ChevronRight className="cursor-pointer" onClick={goToNextWeek} />
						</div>
					)}
					<div className="mt-6 mb-2">
						<UserLineChart userSummary={userSummary} />
					</div>
					<div className="flex items-center justify-center text-sm mt-3 space-x-3">
						<div className="w-3 h-3 rounded-full bg-[#3758F9]"></div>
						<p>Premium</p>
						<div className="w-3 h-3 rounded-full bg-secondary-500"></div>
						<p>Free</p>
					</div>
				</Card>
			</div>
			<AppTrafficChart pages={userVisitStats?.pages ?? []} total={userVisitStats?.total ?? 0} />
			<UserDoughnutChart
				premiumUsers={userSummary?.unique_signups.premium ?? 0}
				freeUsers={userSummary?.unique_signups.free ?? 0}
				total={userSummary?.unique_signups.total ?? 0}
			/>
		</div>
	);
}
