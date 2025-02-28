import { BarElement, Chart as ChartJS, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import Card from "../elements/Card";
import { UserVisitStatsModel } from "@/app/models/user_visit_stats";
import { capitalizeFirstLetter } from "@/app/lib/utils";

ChartJS.register(BarElement, Tooltip, Legend);

interface Props {
  pages: UserVisitStatsModel["pages"];
  total: number;
}

export default function AppTrafficChart({
  pages,
  total,
}: Props) {
  const labelColor = ["#e45fcf", "#ff6aa0", "#ff9474", "#ffc85d", "#f9f871"];

  const chartData = {
    labels: pages.map((page) => capitalizeFirstLetter(page.label.toLowerCase())),
    datasets: [
      {
        data: pages.map((page) => page.percentage),
        backgroundColor: labelColor,
        borderWidth: 0,
      },
    ],
  };

  

  const chartOptions = {
    responsive: true,
    // cutout: "80%",
    // aspectRatio: 1.4,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "black",
        callbacks: {
            label: function(context: any) {
                return `${context.formattedValue}%`;
            },
        }
      },
    },
  };

  return (
    <div className="xl:w-2/5 w-full mb-5">
      <Card className="xl:mr-5 h-full">
        <div className="flex flex-wrap flex-col sm:flex-row">
          <div className="flex flex-col">
            <span className="text-xl font-bold">App Traffic</span>
            <span className="text-md text-neutral-600">User journey through key app sections</span>
          </div>
          <div className="flex flex-col ml-0 sm:ml-auto">
            <span className="text-lg font-bold sm:text-end">{total}</span>
            <span className="text-md text-neutral-600">Total Devices</span>
          </div>
        </div>
        
        <div className="relative m-auto mt-6">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>
    </div>
  );
}
