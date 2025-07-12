import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BankrollChart = ({ data }: { data: number[] }) => {
  const initialBankroll = data[0];
  const finalBankroll = data[data.length - 1];
  const isProfit = finalBankroll > initialBankroll;
  
  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        label: "Bankroll ($)",
        data: data,
        borderColor: isProfit ? "#10b981" : "#ef4444",
        backgroundColor: isProfit 
          ? "rgba(16, 185, 129, 0.1)" 
          : "rgba(239, 68, 68, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: isProfit ? "#10b981" : "#ef4444",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          color: '#374151',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: isProfit ? '#10b981' : '#ef4444',
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          label: function(context) {
            return `Bankroll: $${context.parsed.y.toLocaleString()}`;
          },
          title: function(context) {
            return `Hand ${context[0].label}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Hand Number',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          color: '#6b7280',
        },
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Bankroll ($)',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          color: '#6b7280',
        },
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Bankroll Performance</h3>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600">
            Initial: <span className="font-semibold">${initialBankroll.toLocaleString()}</span>
          </span>
          <span className="text-gray-600">
            Final: <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              ${finalBankroll.toLocaleString()}
            </span>
          </span>
          <span className="text-gray-600">
            Change: <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {isProfit ? '+' : ''}${(finalBankroll - initialBankroll).toLocaleString()} 
              ({((finalBankroll - initialBankroll) / initialBankroll * 100).toFixed(1)}%)
            </span>
          </span>
        </div>
      </div>
      <div className="h-80 bg-white border border-gray-200 rounded-lg p-4">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BankrollChart;