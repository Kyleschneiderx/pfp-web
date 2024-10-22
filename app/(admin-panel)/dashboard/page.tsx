"use client";

import UserDonutChart from "@/app/components/dashboard/user-donut-chart";
import UserLineChart from "@/app/components/dashboard/user-line-chart";
import { UserSummaryModel } from "@/app/models/user_summary_model";
import { getUserSummary } from "@/app/services/client_side/patients";
import { useEffect, useState } from "react";

export default function Page() {
  const currentYear = new Date().getFullYear();
  const [userSummary, setUserSummary] = useState<UserSummaryModel | null>(null);
  const [filter1, setFilter1] = useState<string>("monthly");
  const [year, setYear] = useState<string>(currentYear.toString());

  const fetchUserSummary = async () => {
    const params = `period=${filter1}&date_from=${year}-01-01&date_to=${year}-12-01`;
    const response = await getUserSummary(params);
    setUserSummary(response);
  };

  useEffect(() => {
    fetchUserSummary();
  }, [filter1, year]);

  return (
    <div className="flex flex-wrap">
      <UserLineChart
        userSummary={userSummary}
        onFilter1Change={setFilter1}
        onYearChange={setYear}
      />
      <UserDonutChart />
    </div>
  );
}
