"use client";

import { UserSummaryModel } from "@/app/models/user_summary_model";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

interface Props {
  userSummary: UserSummaryModel | null;
}

export default function UserLineChart({ userSummary }: Props) {
  const primaryColor = "#3758F9";
  const secondaryColor = "#9F9FED";

  const keysArray: string[] = userSummary?.periodic_summary
    ? Object.keys(userSummary?.periodic_summary)
    : [];

  const premiumUser = keysArray.map(
    (key) => userSummary?.periodic_summary[key]?.premium
  );
  const freeUser = keysArray.map(
    (key) => userSummary?.periodic_summary[key]?.free
  );

  const lineChartData = {
    labels: keysArray,
    datasets: [
      {
        label: "Premium Users",
        data: premiumUser,
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
        label: "Free Users",
        data: freeUser,
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
