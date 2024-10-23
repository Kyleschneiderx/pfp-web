import { ArcElement, Chart as ChartJS, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Card from "../elements/Card";

ChartJS.register(ArcElement, Tooltip);

interface Props {
  premiumUsers: number;
  freeUsers: number;
  total: number;
}

export default function UserDoughnutChart({
  premiumUsers,
  freeUsers,
  total,
}: Props) {
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
    cutout: "80%",
    aspectRatio: 1.4,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "black",
      },
    },
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(num % 1000000 !== 0 ? 1 : 0) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0) + "k";
    }
    return num.toString();
  };

  return (
    <Card className="w-[368px] h-[380px] p-[18px]">
      <span className="text-xl font-bold">Users</span>
      <div className="relative m-auto mt-6">
        <Doughnut data={chartData} options={chartOptions} />
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-3 pointer-events-none z-10">
          <p className="text-[30px] font-bold">{formatNumber(total)}</p>
          <p className="text-sm">Daily Sign-ups</p>
        </div>
      </div>
      <div className="flex items-center justify-center text-sm mt-8 mx-auto space-x-3">
        <div className="w-3 h-3 rounded-full bg-[#9F9FED]"></div>
        <p>Premium</p>
        <div className="w-3 h-3 rounded-full bg-[#F2DFD7]"></div>
        <p>Free</p>
      </div>
    </Card>
  );
}
