"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Registrar as escalas necessárias
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
      borderRadius?: number;
    }[];
  };
  title?: string;
  height?: number;
  showLegend?: boolean;
  formatYAxis?: boolean;
  horizontal?: boolean;
}

export function BarChart({ 
  data, 
  title, 
  height = 300, 
  showLegend = true,
  formatYAxis = true,
  horizontal = false
}: BarChartProps) {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        display: showLegend,
        position: "top" as const,
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed.x;
            if (formatYAxis) {
              return `${label}: ${new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value as number)}`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: horizontal ? 'y' as const : 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: !horizontal,
        title: {
          display: false,
        },
        beginAtZero: true,
        grid: {
          display: !horizontal,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: formatYAxis ? (value: any) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value as number) : (value: any) => value,
        },
      },
      y: {
        display: horizontal,
        title: {
          display: false,
        },
        beginAtZero: true,
        grid: {
          display: horizontal,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: formatYAxis ? (value: any) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value as number) : (value: any) => value,
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}
