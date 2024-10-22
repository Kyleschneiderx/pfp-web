"use client";

import { yearOptions } from "@/app/lib/years-options";
import { OptionsModel } from "@/app/models/common_model";
import { UserSummaryModel } from "@/app/models/user_summary_model";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import Card from "../elements/Card";
const SelectCmp = dynamic(
  () => import("@/app/components/elements//SelectCmp"),
  { ssr: false }
);

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

interface Props {
  userSummary: UserSummaryModel | null;
  onFilter1Change: (data: string) => void;
  onYearChange: (year: string) => void;
}

export default function UserLineChart({
  userSummary,
  onFilter1Change,
  onYearChange,
}: Props) {
  const currentYear = new Date().getFullYear();
  const [selectedOption1, setSelectedOption1] = useState<OptionsModel | null>({
    label: "Monthly",
    value: "monthly",
  });
  const [selectedYear, setSelectedYear] = useState<OptionsModel | null>({
    label: currentYear.toString(),
    value: currentYear.toString(),
  });

  const options1: OptionsModel[] = [
    { label: "Monthly", value: "monthly" },
    { label: "Weekly", value: "weekly" },
  ];

  const primaryColor = "#3758F9";
  const secondaryColor = "#9F9FED";

  const handleSelect1Change = (data: OptionsModel | null) => {
    setSelectedOption1(data);
    onFilter1Change(data?.value ?? "");
  };

  const handleYearChange = (data: OptionsModel | null) => {
    setSelectedYear(data);
    onYearChange(data?.value ?? "");
  };

  const months: (keyof UserSummaryModel["periodic_summary"])[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const premiumUser = months.map(
    (month) => userSummary?.periodic_summary[month].premium
  );
  const freeUser = months.map(
    (month) => userSummary?.periodic_summary[month].free
  );

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Premium Users",
        data: premiumUser,
        borderColor: primaryColor,
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: "Free Users",
        data: freeUser,
        borderColor: secondaryColor,
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
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

  return (
    <Card className="w-[728px] mr-6 mb-6 p-[18px]">
      <div className="flex items-start">
        <div>
          <p className="text-[28px] font-bold">{userSummary?.total_users ?? "0"}</p>
          <p className="text-neutral-600">Total Users</p>
        </div>
        <div className="flex items-center text-sm mt-3 ml-auto mr-3 space-x-3">
          <div className="w-3 h-3 rounded-full bg-[#3758F9]"></div>
          <p>Premium</p>
          <div className="w-3 h-3 rounded-full bg-secondary-500"></div>
          <p>Free</p>
        </div>
        <div>
          <SelectCmp
            options={options1}
            value={selectedOption1}
            onChange={(e) => handleSelect1Change(e)}
            className="p-0 mb-2"
            wrapperClassName="z-[999]"
          />
          <SelectCmp
            options={yearOptions}
            value={selectedYear}
            onChange={(e) => handleYearChange(e)}
            placeholder="Select"
            className="p-0"
            wrapperClassName="w-[110px] ml-auto"
          />
        </div>
      </div>
      <div className="mt-6 mb-2">
        <Line data={lineChartData} options={lineChartOptions} />
      </div>
    </Card>
  );
}
