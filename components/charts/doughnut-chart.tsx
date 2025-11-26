"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Registrar as escalas necessárias
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      hoverOffset?: number;
    }[];
  };
  title?: string;
  height?: number;
  showLegend?: boolean;
  formatValues?: boolean;
  cutout?: string;
}

export function DoughnutChart({ 
  data, 
  title, 
  height = 300, 
  showLegend = true,
  formatValues = true,
  cutout = "60%"
}: DoughnutChartProps) {
  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            if (formatValues) {
              return `${label}: ${new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value)} (${percentage}%)`;
            }
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    },
  };

  // Aplicar cutout personalizado
  const chartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      cutout,
    })),
  };

  return (
    <div style={{ height }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
