"use client";

import AccessLocked from "@/app/components/access-locked";
import InviteLineChart from "@/app/components/dashboard/InviteLineChart";
import VisitPaymentLineChart from "@/app/components/dashboard/VisitPaymentLineChart";
import UserCoachPromptChart from "@/app/components/dashboard/user-coach-prompt-chart";
import UserDoughnutChart from "@/app/components/dashboard/user-doughnut-chart";
import UserLineChart from "@/app/components/dashboard/user-line-chart";
import Card from "@/app/components/elements/Card";
import { PERMISSIONS } from "@/app/lib/constants";
import { formatDate, getLastLoginStatus, getWeekRange } from "@/app/lib/utils";
import { yearOptions } from "@/app/lib/years-options";
import type { OptionsModel } from "@/app/models/common_model";
import type { InviteStatsModel } from "@/app/models/invite_stats_model";
import type { Meeting } from "@/app/models/meeting_model";
import type { PatientModel } from "@/app/models/patient_model";
import type { UserSummaryModel } from "@/app/models/user_summary_model";
import type { VisitPaymentStatsModel } from "@/app/models/visit_payment_stats_model";
import { getMeetingsList } from "@/app/services/client_side/meetings";
import { getPatientsList, getUserSummary } from "@/app/services/client_side/patients";
import { getInviteStats, getVisitPaymentStats } from "@/app/services/client_side/stats";
import clsx from "clsx";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const AccessControl = dynamic(() => import("@/app/components/access-control"), {
	ssr: false,
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatWeekLabel = (date: Date): string =>
	date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const formatShortDate = (iso: string): string =>
	new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const formatTime = (iso: string): string =>
	new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

// ─── Sub-components ─────────────────────────────────────────────────────────

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
	return (
		<div className="flex items-center gap-1 text-xs font-medium text-neutral-600">
			<button type="button" onClick={onPrev} className="p-0.5 hover:text-neutral-900 transition-colors">
				<ChevronLeft size={14} />
			</button>
			<span className="whitespace-nowrap">
				{formatWeekLabel(start)} – {formatWeekLabel(end)}
			</span>
			<button type="button" onClick={onNext} className="p-0.5 hover:text-neutral-900 transition-colors">
				<ChevronRight size={14} />
			</button>
		</div>
	);
}

function StatusPill({ label }: { label?: string }) {
	const map: Record<string, string> = {
		active: "bg-success-50 text-success-600",
		inactive: "bg-neutral-100 text-neutral-600",
		upcoming: "bg-accents-500 text-primary-700",
		completed: "bg-success-50 text-success-600",
		cancelled: "bg-error-25 text-error-500",
		draft: "bg-neutral-100 text-neutral-600",
	};
	const key = label?.toLowerCase() ?? "";
	return (
		<span
			className={clsx("text-xs font-medium px-2 py-0.5 rounded-full", map[key] ?? "bg-neutral-100 text-neutral-600")}
		>
			{label ?? "—"}
		</span>
	);
}

interface StatCardProps {
	title: string;
	total: string | number;
	period: string;
	onPeriodChange: (v: string) => void;
	year: OptionsModel | null;
	onYearChange: (v: OptionsModel | null) => void;
	weekStart: Date;
	weekEnd: Date;
	onPrevWeek: () => void;
	onNextWeek: () => void;
	legend: React.ReactNode;
	children: React.ReactNode;
}

function StatCard({
	title,
	total,
	period,
	onPeriodChange,
	year,
	onYearChange,
	weekStart,
	weekEnd,
	onPrevWeek,
	onNextWeek,
	legend,
	children,
}: StatCardProps) {
	return (
		<Card>
			{/* Row 1: title + total chip + toggle at end */}
			<div className="flex items-center justify-between gap-3 mb-3">
				<div className="flex items-center gap-2.5 min-w-0">
					<span className="text-sm font-semibold text-neutral-900 truncate">{title}</span>
					<span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full shrink-0">
						{total} total
					</span>
				</div>
				<PeriodToggle value={period} onChange={onPeriodChange} />
			</div>
			{/* Row 2: date selector — centered, more prominent */}
			<div className="flex justify-center mb-4 min-h-[32px] items-center">
				{period === "weekly" ? (
					<WeekNav start={weekStart} end={weekEnd} onPrev={onPrevWeek} onNext={onNextWeek} />
				) : (
					<select
						value={year?.value ?? ""}
						onChange={(e) => onYearChange({ label: e.target.value, value: e.target.value })}
						className="text-xs font-medium border border-neutral-200 bg-white rounded-md px-3 py-1.5 text-neutral-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
					>
						{yearOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				)}
			</div>
			<div className="mb-1">{children}</div>
			<div className="flex items-center justify-center text-xs mt-3 gap-3 text-neutral-600">{legend}</div>
		</Card>
	);
}

function LegendDot({ color, label }: { color: string; label: string }) {
	return (
		<>
			<div className={clsx("w-2.5 h-2.5 rounded-full", color)} />
			<span>{label}</span>
		</>
	);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
	const currentYear = new Date().getFullYear();

	// Users chart
	const [period1, setPeriod1] = useState("monthly");
	const [year1, setYear1] = useState<OptionsModel | null>({ label: `${currentYear}`, value: `${currentYear}` });
	const [date1, setDate1] = useState(new Date());
	const [weekStart1, setWeekStart1] = useState(getWeekRange(date1).startOfWeek);
	const [weekEnd1, setWeekEnd1] = useState(getWeekRange(date1).endOfWeek);
	const [userSummary, setUserSummary] = useState<UserSummaryModel | null>(null);

	// Invite chart
	const [periodInvite, setPeriodInvite] = useState("monthly");
	const [yearInvite, setYearInvite] = useState<OptionsModel | null>({
		label: `${currentYear}`,
		value: `${currentYear}`,
	});
	const [dateInvite, setDateInvite] = useState(new Date());
	const [weekStartInvite, setWeekStartInvite] = useState(getWeekRange(dateInvite).startOfWeek);
	const [weekEndInvite, setWeekEndInvite] = useState(getWeekRange(dateInvite).endOfWeek);
	const [inviteStats, setInviteStats] = useState<InviteStatsModel | null>(null);

	// Visit payment chart
	const [periodVisit, setPeriodVisit] = useState("monthly");
	const [yearVisit, setYearVisit] = useState<OptionsModel | null>({ label: `${currentYear}`, value: `${currentYear}` });
	const [dateVisit, setDateVisit] = useState(new Date());
	const [weekStartVisit, setWeekStartVisit] = useState(getWeekRange(dateVisit).startOfWeek);
	const [weekEndVisit, setWeekEndVisit] = useState(getWeekRange(dateVisit).endOfWeek);
	const [visitPaymentStats, setVisitPaymentStats] = useState<VisitPaymentStatsModel | null>(null);

	// Preview tables
	const [patients, setPatients] = useState<PatientModel[]>([]);
	const [meetings, setMeetings] = useState<Meeting[]>([]);

	// Week nav helpers
	const shiftWeek = (
		current: Date,
		dir: 1 | -1,
		setDate: (d: Date) => void,
		setStart: (d: Date) => void,
		setEnd: (d: Date) => void,
	) => {
		const d = new Date(current);
		d.setDate(d.getDate() + dir * 7);
		setDate(d);
		setStart(getWeekRange(d).startOfWeek);
		setEnd(getWeekRange(d).endOfWeek);
	};

	const fetchUserSummary = async () => {
		const dateFrom = period1 === "weekly" ? formatDate(weekStart1) : `${year1?.value}-01-01`;
		const dateTo = period1 === "weekly" ? formatDate(weekEnd1) : `${year1?.value}-12-01`;
		const res = await getUserSummary(`period=${period1}&date_from=${dateFrom}&date_to=${dateTo}`);
		setUserSummary(res);
	};

	const fetchInviteStats = async () => {
		const dateFrom = periodInvite === "weekly" ? formatDate(weekStartInvite) : `${yearInvite?.value}-01-01`;
		const dateTo = periodInvite === "weekly" ? formatDate(weekEndInvite) : `${yearInvite?.value}-12-01`;
		const res = await getInviteStats(`period=${periodInvite}&date_from=${dateFrom}&date_to=${dateTo}`);
		setInviteStats(res);
	};

	const fetchVisitPaymentStats = async () => {
		const dateFrom = periodVisit === "weekly" ? formatDate(weekStartVisit) : `${yearVisit?.value}-01-01`;
		const dateTo = periodVisit === "weekly" ? formatDate(weekEndVisit) : `${yearVisit?.value}-12-01`;
		const res = await getVisitPaymentStats(`period=${periodVisit}&date_from=${dateFrom}&date_to=${dateTo}`);
		setVisitPaymentStats(res);
	};

	const fetchPatients = async () => {
		try {
			const res = await getPatientsList("page=1&page_items=10&sort=id:DESC");
			setPatients(res.data ?? []);
		} catch {
			setPatients([]);
		}
	};

	const fetchMeetings = async () => {
		try {
			const res = await getMeetingsList("page=1&page_items=10&status_id=6&sort=starts_at:ASC");
			setMeetings(res.data ?? []);
		} catch {
			setMeetings([]);
		}
	};

	useEffect(() => {
		fetchUserSummary();
	}, [period1, year1, weekStart1]);
	useEffect(() => {
		fetchInviteStats();
	}, [periodInvite, yearInvite, weekStartInvite]);
	useEffect(() => {
		fetchVisitPaymentStats();
	}, [periodVisit, yearVisit, weekStartVisit]);
	useEffect(() => {
		fetchPatients();
		fetchMeetings();
	}, []);

	return (
		<div className="space-y-5">
			{/* ── Row 1: 3 line chart cards ── */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
				<AccessControl required={[PERMISSIONS.STATS_USERS]} fallback={<AccessLocked className="h-72" />}>
					<StatCard
						title="Users"
						total={userSummary?.total_users ?? 0}
						period={period1}
						onPeriodChange={setPeriod1}
						year={year1}
						onYearChange={setYear1}
						weekStart={weekStart1}
						weekEnd={weekEnd1}
						onPrevWeek={() => shiftWeek(date1, -1, setDate1, setWeekStart1, setWeekEnd1)}
						onNextWeek={() => shiftWeek(date1, 1, setDate1, setWeekStart1, setWeekEnd1)}
						legend={
							<>
								<LegendDot color="bg-[#3758F9]" label="Premium" />
								<LegendDot color="bg-secondary-500" label="Free" />
							</>
						}
					>
						<UserLineChart userSummary={userSummary} />
					</StatCard>
				</AccessControl>

				<AccessControl required={[PERMISSIONS.STATS_INVITED]} fallback={<AccessLocked className="h-72" />}>
					<StatCard
						title="Invites"
						total={inviteStats?.total_invites ?? 0}
						period={periodInvite}
						onPeriodChange={setPeriodInvite}
						year={yearInvite}
						onYearChange={setYearInvite}
						weekStart={weekStartInvite}
						weekEnd={weekEndInvite}
						onPrevWeek={() => shiftWeek(dateInvite, -1, setDateInvite, setWeekStartInvite, setWeekEndInvite)}
						onNextWeek={() => shiftWeek(dateInvite, 1, setDateInvite, setWeekStartInvite, setWeekEndInvite)}
						legend={
							<>
								<LegendDot color="bg-[#3758F9]" label="Onboarded" />
								<LegendDot color="bg-secondary-500" label="Not Onboarded" />
							</>
						}
					>
						<InviteLineChart inviteStats={inviteStats} />
					</StatCard>
				</AccessControl>

				<AccessControl required={[PERMISSIONS.STATS_VISIT_PAYMENT]} fallback={<AccessLocked className="h-72" />}>
					<StatCard
						title="Telehealth Visits"
						total={visitPaymentStats?.stats?.total_count ?? 0}
						period={periodVisit}
						onPeriodChange={setPeriodVisit}
						year={yearVisit}
						onYearChange={setYearVisit}
						weekStart={weekStartVisit}
						weekEnd={weekEndVisit}
						onPrevWeek={() => shiftWeek(dateVisit, -1, setDateVisit, setWeekStartVisit, setWeekEndVisit)}
						onNextWeek={() => shiftWeek(dateVisit, 1, setDateVisit, setWeekStartVisit, setWeekEndVisit)}
						legend={
							<>
								<LegendDot color="bg-[#2c5bd4]" label="Upcoming" />
								<LegendDot color="bg-[#4CAF50]" label="Complete" />
								<LegendDot color="bg-[#FFC107]" label="Draft" />
								<LegendDot color="bg-[#F44336]" label="Canceled" />
							</>
						}
					>
						<VisitPaymentLineChart visitPaymentStats={visitPaymentStats} />
					</StatCard>
				</AccessControl>
			</div>

			{/* ── Row 2: doughnut + coach prompts ── */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<AccessControl required={[PERMISSIONS.STATS_DAILY_SIGNUPS]} fallback={<AccessLocked className="h-64" />}>
					<UserDoughnutChart
						premiumUsers={userSummary?.unique_signups.premium ?? 0}
						freeUsers={userSummary?.unique_signups.free ?? 0}
						total={userSummary?.unique_signups.total ?? 0}
					/>
				</AccessControl>

				<AccessControl required={[PERMISSIONS.STATS_AI_PROMPTS]} fallback={<AccessLocked className="h-64" />}>
					<UserCoachPromptChart />
				</AccessControl>
			</div>

			{/* ── Row 3: preview tables ── */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
				<AccessControl required={[PERMISSIONS.PATIENT_VIEW]} fallback={<AccessLocked className="h-64" />}>
					<div className="bg-white rounded-lg drop-shadow-center overflow-hidden">
						<div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
							<div className="flex items-center gap-2">
								<Users size={15} className="text-neutral-400" />
								<span className="text-sm font-semibold text-neutral-900">Recent Patients</span>
							</div>
							<Link
								href="/patients"
								className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
							>
								View all <ArrowRight size={12} />
							</Link>
						</div>
						{patients.length === 0 ? (
							<div className="py-12 text-center text-sm text-neutral-400">No patients found</div>
						) : (
							<div className="divide-y divide-neutral-100">
								{patients.map((patient) => (
									<div key={patient.id} className="flex items-center gap-3 px-5 py-3">
										<Image
											src={patient.user_profile.photo || "/images/avatar.png"}
											width={36}
											height={36}
											alt=""
											className="w-9 h-9 rounded-full object-cover shrink-0"
										/>
										<div className="min-w-0 flex-1">
											<Link
												href={`/patients/${patient.id}/edit`}
												className="text-sm font-medium text-primary-500 hover:text-primary-600 truncate block leading-tight"
											>
												{patient.user_profile.name}
											</Link>
											<p className="text-xs text-neutral-400 truncate">
												{patient.email}
												{patient.provider && (
													<>
														<span className="mx-1.5 text-neutral-300">·</span>
														<span className="text-neutral-500">{patient.provider.user_profile.name}</span>
													</>
												)}
											</p>
										</div>
										<div className="flex flex-col items-end gap-1 shrink-0">
											<StatusPill
												label={
													patient.status.value === "Inactive"
														? "Inactive"
														: patient.last_login_at
															? getLastLoginStatus(patient.last_login_at)
															: "Active"
												}
											/>
											<span
												className={clsx(
													"text-xs font-medium",
													patient.user_type.value === "Premium" ? "text-primary-500" : "text-neutral-400",
												)}
											>
												{patient.user_type.value}
											</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</AccessControl>

				<AccessControl required={[PERMISSIONS.VISIT_VIEW]} fallback={<AccessLocked className="h-64" />}>
					<div className="bg-white rounded-lg drop-shadow-center overflow-hidden">
						<div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
							<div className="flex items-center gap-2">
								<span className="text-neutral-400">
									<Calendar size={15} />
								</span>
								<span className="text-sm font-semibold text-neutral-900">Upcoming Meetings</span>
							</div>
							<Link
								href="/telehealth"
								className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
							>
								View all <ArrowRight size={12} />
							</Link>
						</div>
						{meetings.length === 0 ? (
							<div className="py-12 text-center text-sm text-neutral-400">No upcoming meetings</div>
						) : (
							<div className="divide-y divide-neutral-100">
								{meetings.map((meeting) => (
									<div key={meeting.id} className="flex items-center justify-between px-5 py-3 gap-3">
										<div className="min-w-0">
											<p className="text-sm font-medium text-neutral-900 truncate">
												{meeting.user_profile?.name || "—"}
											</p>
											<p className="text-xs text-neutral-400">
												{formatShortDate(meeting.starts_at)}
												<span className="mx-1.5 text-neutral-300">·</span>
												{formatTime(meeting.starts_at)}
											</p>
										</div>
										<div className="flex items-center gap-2 shrink-0">
											<span className="text-xs text-neutral-400 hidden sm:block">{meeting.duration} min</span>
											<StatusPill label={meeting.status?.value} />
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</AccessControl>
			</div>
		</div>
	);
}
