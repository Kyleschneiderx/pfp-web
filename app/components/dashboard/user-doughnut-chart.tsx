"use client";

import { ArcElement, Chart as ChartJS, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Card from "../elements/Card";

ChartJS.register(ArcElement, Tooltip);

interface Props {
	premiumUsers: number;
	freeUsers: number;
	total: number;
}

function formatNumber(num: number): string {
	if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num % 1_000_000 !== 0 ? 1 : 0)}M`;
	if (num >= 1_000) return `${(num / 1_000).toFixed(num % 1_000 !== 0 ? 1 : 0)}k`;
	return num.toString();
}

export default function UserDoughnutChart({ premiumUsers, freeUsers, total }: Props) {
	const chartData = {
		labels: ["Premium Users", "Free Users"],
		datasets: [
			{
				data: [premiumUsers, freeUsers],
				backgroundColor: ["#9F9FED", "#F2DFD7"],
				borderWidth: 0,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		cutout: "78%",
		aspectRatio: 2,
		plugins: {
			legend: { display: false },
			tooltip: { enabled: true, backgroundColor: "black" },
		},
	};

	return (
		<Card>
			{/* Title row — same compact style as stats cards */}
			<div className="flex items-center gap-2.5 mb-4">
				<span className="text-sm font-semibold text-neutral-900">Daily Sign-ups</span>
				<span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
					{formatNumber(total)} today
				</span>
			</div>

			<div className="relative">
				<Doughnut data={chartData} options={chartOptions} />
				<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
					<p className="text-xl font-bold leading-tight">{formatNumber(total)}</p>
					<p className="text-xs text-neutral-500">sign-ups</p>
				</div>
			</div>

			<div className="flex items-center justify-center text-xs mt-4 gap-3 text-neutral-600">
				<div className="w-2.5 h-2.5 rounded-full bg-[#9F9FED]" />
				<span>Premium</span>
				<div className="w-2.5 h-2.5 rounded-full bg-[#F2DFD7]" />
				<span>Free</span>
			</div>
		</Card>
	);
}
