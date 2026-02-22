"use client";

import type { VisitPaymentStatsModel } from "@/app/models/visit_payment_stats_model";
import { CategoryScale, Chart as ChartJS, LinearScale, LineElement, PointElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface Props {
	visitPaymentStats: VisitPaymentStatsModel | null;
}

export default function VisitPaymentLineChart({ visitPaymentStats }: Props) {
	const successColor = "#4CAF50"; // Green
	const draftColor = "#FFC107"; // Amber
	const cancelColor = "#F44336"; // Red
	const upcomingColor = "#2c5bd4"; // Blue

	const keysArray: string[] = visitPaymentStats?.periodic_summary
		? visitPaymentStats.periodic_summary.map((p) => p.period_label)
		: [];

	const completeValues = keysArray.map((key) => {
		const period = visitPaymentStats?.periodic_summary.find((p) => p.period_label === key);
		return period?.complete ?? 0;
	});
	const draftValues = keysArray.map((key) => {
		const period = visitPaymentStats?.periodic_summary.find((p) => p.period_label === key);
		return period?.draft ?? 0;
	});
	const cancelValues = keysArray.map((key) => {
		const period = visitPaymentStats?.periodic_summary.find((p) => p.period_label === key);
		return period?.canceled ?? 0;
	});
	const upcomingValues = keysArray.map((key) => {
		const period = visitPaymentStats?.periodic_summary.find((p) => p.period_label === key);
		return period?.upcoming ?? 0;
	});

	const lineChartData = {
		labels: keysArray,
		datasets: [
			{
				label: "Upcoming",
				data: upcomingValues,
				borderColor: upcomingColor,
				borderWidth: 3,
				fill: false,
				tension: 0.4,
				pointRadius: 6,
				pointBackgroundColor: upcomingColor,
				pointBorderColor: "white",
				pointBorderWidth: 3,
			},
			{
				label: "Complete",
				data: completeValues,
				borderColor: successColor,
				borderWidth: 3,
				fill: false,
				tension: 0.4,
				pointRadius: 6,
				pointBackgroundColor: successColor,
				pointBorderColor: "white",
				pointBorderWidth: 3,
			},
			{
				label: "Draft",
				data: draftValues,
				borderColor: draftColor,
				borderWidth: 3,
				fill: false,
				tension: 0.4,
				pointRadius: 6,
				pointBackgroundColor: draftColor,
				pointBorderColor: "white",
				pointBorderWidth: 3,
			},
			{
				label: "Canceled",
				data: cancelValues,
				borderColor: cancelColor,
				borderWidth: 3,
				fill: false,
				tension: 0.4,
				pointRadius: 6,
				pointBackgroundColor: cancelColor,
				pointBorderColor: "white",
				pointBorderWidth: 3,
			},
		],
	};

	const lineChartOptions = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: true,
			},
		},
		scales: {
			y: {
				grid: {
					display: false,
				},
				beginAtZero: true,
				min: 0,
			},
			x: {
				grid: {
					display: true,
				},
			},
		},
	};

	return <Line data={lineChartData} options={lineChartOptions} />;
}
