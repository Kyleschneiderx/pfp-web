"use client";

import UserDoughnutChart from "@/app/components/dashboard/user-doughnut-chart";
import UserLineChart from "@/app/components/dashboard/user-line-chart";
import AppTrafficChart from "@/app/components/dashboard/app-traffic-chart";
import Card from "@/app/components/elements/Card";
import { formatDate, getWeekRange } from "@/app/lib/utils";
import { yearOptions } from "@/app/lib/years-options";
import type { OptionsModel } from "@/app/models/common_model";
import type { UserSummaryModel } from "@/app/models/user_summary_model";
import { getUserSummary } from "@/app/services/client_side/patients";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import UserCoachPromptChart from "@/app/components/dashboard/user-coach-prompt-chart";
import { PERMISSIONS } from "@/app/lib/constants";
import AccessLocked from "@/app/components/access-locked";
import { monthOptions } from "@/app/lib/months-options";
import { getInviteStats, getVisitPaymentStats } from "@/app/services/client_side/stats";
import InviteLineChart from "@/app/components/dashboard/InviteLineChart";
import VisitPaymentLineChart from "@/app/components/dashboard/VisitPaymentLineChart";
import type { InviteStatsModel } from "@/app/models/invite_stats_model";
import type { VisitPaymentStatsModel } from "@/app/models/visit_payment_stats_model";

const SelectCmp = dynamic(() => import("@/app/components/elements/SelectCmp"), {
	ssr: false,
});

const AccessControl = dynamic(() => import("@/app/components/access-control"), {
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

	// Invite Stats State
	const [selectedOptionInvite, setSelectedOptionInvite] = useState<OptionsModel | null>({
		label: "Monthly",
		value: "monthly",
	});
	const [selectedYearInvite, setSelectedYearInvite] = useState<OptionsModel | null>({
		label: currentYear.toString(),
		value: currentYear.toString(),
	});
	const [currentDateInvite, setCurrentDateInvite] = useState<Date>(new Date());
	const [startOfWeekInvite, setStartOfWeekInvite] = useState<Date>(getWeekRange(currentDateInvite).startOfWeek);
	const [endOfWeekInvite, setEndOfWeekInvite] = useState<Date>(getWeekRange(currentDateInvite).endOfWeek);
	const [inviteStats, setInviteStats] = useState<InviteStatsModel | null>(null);

	// Visit Payment Stats State
	const [selectedOptionVisit, setSelectedOptionVisit] = useState<OptionsModel | null>({
		label: "Monthly",
		value: "monthly",
	});
	const [selectedYearVisit, setSelectedYearVisit] = useState<OptionsModel | null>({
		label: currentYear.toString(),
		value: currentYear.toString(),
	});
	const [currentDateVisit, setCurrentDateVisit] = useState<Date>(new Date());
	const [startOfWeekVisit, setStartOfWeekVisit] = useState<Date>(getWeekRange(currentDateVisit).startOfWeek);
	const [endOfWeekVisit, setEndOfWeekVisit] = useState<Date>(getWeekRange(currentDateVisit).endOfWeek);
	const [visitPaymentStats, setVisitPaymentStats] = useState<VisitPaymentStatsModel | null>(null);

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

	// Invite Stats Week Navigation
	const goToPreviousWeekInvite = () => {
		const newDate = new Date(currentDateInvite);
		newDate.setDate(newDate.getDate() - 7);
		setStartOfWeekInvite(getWeekRange(newDate).startOfWeek);
		setEndOfWeekInvite(getWeekRange(newDate).endOfWeek);
		setCurrentDateInvite(newDate);
	};

	const goToNextWeekInvite = () => {
		const newDate = new Date(currentDateInvite);
		newDate.setDate(newDate.getDate() + 7);
		setStartOfWeekInvite(getWeekRange(newDate).startOfWeek);
		setEndOfWeekInvite(getWeekRange(newDate).endOfWeek);
		setCurrentDateInvite(newDate);
	};

	// Visit Payment Week Navigation
	const goToPreviousWeekVisit = () => {
		const newDate = new Date(currentDateVisit);
		newDate.setDate(newDate.getDate() - 7);
		setStartOfWeekVisit(getWeekRange(newDate).startOfWeek);
		setEndOfWeekVisit(getWeekRange(newDate).endOfWeek);
		setCurrentDateVisit(newDate);
	};

	const goToNextWeekVisit = () => {
		const newDate = new Date(currentDateVisit);
		newDate.setDate(newDate.getDate() + 7);
		setStartOfWeekVisit(getWeekRange(newDate).startOfWeek);
		setEndOfWeekVisit(getWeekRange(newDate).endOfWeek);
		setCurrentDateVisit(newDate);
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

	// Invite Stats Handlers
	const handleSelectInviteChange = (data: OptionsModel | null) => {
		setSelectedOptionInvite(data);
	};

	const handleYearInviteChange = (data: OptionsModel | null) => {
		setSelectedYearInvite(data);
	};

	// Visit Payment Handlers
	const handleSelectVisitChange = (data: OptionsModel | null) => {
		setSelectedOptionVisit(data);
	};

	const handleYearVisitChange = (data: OptionsModel | null) => {
		setSelectedYearVisit(data);
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

	// Invite Stats Fetch
	const fetchInviteStats = async () => {
		let dateFrom = `${selectedYearInvite?.value}-01-01`;
		let dateTo = `${selectedYearInvite?.value}-12-01`;

		if (selectedOptionInvite?.value === "weekly") {
			dateFrom = formatDate(startOfWeekInvite);
			dateTo = formatDate(endOfWeekInvite);
		}

		const params = `period=${selectedOptionInvite?.value}&date_from=${dateFrom}&date_to=${dateTo}`;
		const response = await getInviteStats(params);
		setInviteStats(response);
	};

	// Visit Payment Stats Fetch
	const fetchVisitPaymentStats = async () => {
		let dateFrom = `${selectedYearVisit?.value}-01-01`;
		let dateTo = `${selectedYearVisit?.value}-12-01`;

		if (selectedOptionVisit?.value === "weekly") {
			dateFrom = formatDate(startOfWeekVisit);
			dateTo = formatDate(endOfWeekVisit);
		}

		const params = `period=${selectedOptionVisit?.value}&date_from=${dateFrom}&date_to=${dateTo}`;
		const response = await getVisitPaymentStats(params);
		setVisitPaymentStats(response);
	};

	useEffect(() => {
		fetchUserSummary();
	}, [selectedOption1, selectedYear, startOfWeek]);

	useEffect(() => {
		fetchInviteStats();
	}, [selectedOptionInvite, selectedYearInvite, startOfWeekInvite]);

	useEffect(() => {
		fetchVisitPaymentStats();
	}, [selectedOptionVisit, selectedYearVisit, startOfWeekVisit]);

	return (
		<div className="flex flex-wrap flex-col lg:flex-row">
			<div className="flex flex-col w-full lg:w-2/3">
				<div className="lg:mr-5 mr-0">
					<div className="w-full mb-5">
						<AccessControl
							required={[PERMISSIONS.STATS_USERS]}
							fallback={<AccessLocked title="Users" className="h-96" />}
						>
							<Card className="">
								<span className="text-xl font-bold">Users</span>
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
									<div className="w-3 h-3 rounded-full bg-[#3758F9]" />
									<p>Premium</p>
									<div className="w-3 h-3 rounded-full bg-secondary-500" />
									<p>Free</p>
								</div>
							</Card>
						</AccessControl>
					</div>
					<div className="w-full mb-5">
						<AccessControl
							required={[PERMISSIONS.STATS_INVITED]}
							fallback={<AccessLocked title="Invite Stats" className="h-96" />}
						>
							<Card className="">
								<span className="text-xl font-bold">Invite</span>
								<div className="flex justify-between sm:flex-row items-start">
									<div className="flex flex-col">
										<p className="text-[28px] font-bold">{inviteStats?.total_invites ?? "0"}</p>
										<p className="text-neutral-600">Total Invites</p>
									</div>
									<div className="flex flex-wrap items-center space-x-2">
										<SelectCmp
											options={options1}
											value={selectedOptionInvite}
											onChange={(e) => handleSelectInviteChange(e as OptionsModel)}
											className="p-0"
											wrapperClassName="z-[999]"
										/>
										{selectedOptionInvite?.value === "monthly" && (
											<SelectCmp
												options={yearOptions}
												value={selectedYearInvite}
												onChange={(e) => handleYearInviteChange(e as OptionsModel)}
												placeholder="Select Year"
												className="p-0"
												wrapperClassName="w-[110px] ml-0 sm:ml-auto w-full sm:w-auto"
											/>
										)}
									</div>
								</div>
								{selectedOptionInvite?.value === "weekly" && (
									<div className="flex items-center justify-center font-medium text-sm space-x-2 mt-3">
										<ChevronLeft className="cursor-pointer" onClick={goToPreviousWeekInvite} />
										<span>
											{formatDate1(startOfWeekInvite)} - {formatDate1(endOfWeekInvite)}
										</span>
										<ChevronRight className="cursor-pointer" onClick={goToNextWeekInvite} />
									</div>
								)}
								<div className="mt-6 mb-2">
									<InviteLineChart inviteStats={inviteStats} />
								</div>
								<div className="flex items-center justify-center text-sm mt-3 space-x-3">
									<div className="w-3 h-3 rounded-full bg-[#3758F9]" />
									<p>Onboarded</p>
									<div className="w-3 h-3 rounded-full bg-secondary-500" />
									<p>Not Onboarded</p>
								</div>
							</Card>
						</AccessControl>
					</div>
					<div className="w-full mb-5">
						<AccessControl
							required={[PERMISSIONS.STATS_VISIT_PAYMENT]}
							fallback={<AccessLocked title="Visit Payment Stats" className="h-96" />}
						>
							<Card className="">
								<span className="text-xl font-bold">Telehealth Visits</span>
								<div className="flex justify-between sm:flex-row items-start">
									<div className="flex flex-col">
										<div>
											<p className="text-[28px] font-bold">{visitPaymentStats?.stats?.total_count ?? "0"}</p>
											<p className="text-neutral-600">Total Visits</p>
										</div>
									</div>
									<div className="flex flex-wrap items-center space-x-2">
										<SelectCmp
											options={options1}
											value={selectedOptionVisit}
											onChange={(e) => handleSelectVisitChange(e as OptionsModel)}
											className="p-0"
											wrapperClassName="z-[999]"
										/>
										{selectedOptionVisit?.value === "monthly" && (
											<SelectCmp
												options={yearOptions}
												value={selectedYearVisit}
												onChange={(e) => handleYearVisitChange(e as OptionsModel)}
												placeholder="Select Year"
												className="p-0"
												wrapperClassName="w-[110px] ml-0 sm:ml-auto w-full sm:w-auto"
											/>
										)}
									</div>
								</div>
								{selectedOptionVisit?.value === "weekly" && (
									<div className="flex items-center justify-center font-medium text-sm space-x-2 mt-3">
										<ChevronLeft className="cursor-pointer" onClick={goToPreviousWeekVisit} />
										<span>
											{formatDate1(startOfWeekVisit)} - {formatDate1(endOfWeekVisit)}
										</span>
										<ChevronRight className="cursor-pointer" onClick={goToNextWeekVisit} />
									</div>
								)}
								<div className="mt-6 mb-2">
									<VisitPaymentLineChart visitPaymentStats={visitPaymentStats} />
								</div>
								<div className="flex items-center justify-center text-sm mt-3 space-x-3">
									<div className="w-3 h-3 rounded-full bg-[#2c5bd4]" />
									<p>Upcoming</p>
									<div className="w-3 h-3 rounded-full bg-[#4CAF50]" />
									<p>Complete</p>
									<div className="w-3 h-3 rounded-full bg-[#FFC107]" />
									<p>Draft</p>
									<div className="w-3 h-3 rounded-full bg-[#F44336]" />
									<p>Canceled</p>
								</div>
							</Card>
						</AccessControl>
					</div>
				</div>
			</div>
			<div className="flex flex-col w-full lg:w-1/3">
				<div className="w-full h-auto mb-5">
					<AccessControl
						required={[PERMISSIONS.STATS_DAILY_SIGNUPS]}
						fallback={<AccessLocked title="Daily Sign-ups" className="h-96" />}
					>
						<UserDoughnutChart
							premiumUsers={userSummary?.unique_signups.premium ?? 0}
							freeUsers={userSummary?.unique_signups.free ?? 0}
							total={userSummary?.unique_signups.total ?? 0}
						/>
					</AccessControl>
				</div>
				<div className="w-full h-auto">
					<AccessControl
						required={[PERMISSIONS.STATS_AI_PROMPTS]}
						fallback={<AccessLocked title="Users AI Coach Prompts" className="h-96" />}
					>
						<UserCoachPromptChart />
					</AccessControl>
				</div>
			</div>
		</div>
	);
}
