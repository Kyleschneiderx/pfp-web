"use client";

import { InviteStatsModel } from "@/app/models/invite_stats_model";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

interface Props {
  inviteStats: InviteStatsModel | null;
}

export default function InviteLineChart({ inviteStats }: Props) {
  const primaryColor = "#3758F9";
  const secondaryColor = "#9F9FED";

  const keysArray: string[] = inviteStats?.periodic_summary
    ? inviteStats.periodic_summary.map((p) => p.period_label)
    : [];

  const onboardedValues = keysArray.map((key) => {
    const period = inviteStats?.periodic_summary.find((p) => p.period_label === key);
    return period?.onboarded.total ?? 0;
  });

  const notOnboardedValues = keysArray.map((key) => {
    const period = inviteStats?.periodic_summary.find((p) => p.period_label === key);
    return period?.not_onboarded.total ?? 0;
  });

  const lineChartData = {
    labels: keysArray,
    datasets: [
      {
        label: "Onboarded",
        data: onboardedValues,
        borderColor: primaryColor,
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: primaryColor,
        pointBorderColor: "white",
        pointBorderWidth: 3,
      },
      {
        label: "Not Onboarded",
        data: notOnboardedValues,
        borderColor: secondaryColor,
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: secondaryColor,
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

