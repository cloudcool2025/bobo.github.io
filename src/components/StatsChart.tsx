import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatsChartProps {
  stats: {
    wins: number;
    losses: number;
    total: number;
    fouls: number;
    lucky: number;
  };
  matchHistory: {
    date: string;
    initiatorScore: number;
    opponentScore: number;
    winner: string;
  }[];
}

export default function StatsChart({ stats, matchHistory }: StatsChartProps) {
  const doughnutRef = useRef<ChartJS<'doughnut'>>(null);
  const barRef = useRef<ChartJS<'bar'>>(null);

  const doughnutData = {
    labels: ['胜场', '败场'],
    datasets: [
      {
        data: [stats.wins, stats.losses],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: matchHistory.slice(0, 10).map((m) => m.date),
    datasets: [
      {
        label: '我方得分',
        data: matchHistory.slice(0, 10).map((m) => m.initiatorScore),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 1,
      },
      {
        label: '对手得分',
        data: matchHistory.slice(0, 10).map((m) => m.opponentScore),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#d97706',
          font: {
            size: 14,
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#d97706',
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#d97706',
          font: {
            size: 10,
          },
        },
        grid: {
          color: 'rgba(139, 69, 19, 0.3)',
        },
      },
      y: {
        ticks: {
          color: '#d97706',
        },
        grid: {
          color: 'rgba(139, 69, 19, 0.3)',
        },
      },
    },
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-green-800/90 backdrop-blur rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-400 mb-4 text-center">胜负比例</h3>
        <div className="h-64">
          <Doughnut ref={doughnutRef} data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
      <div className="bg-green-800/90 backdrop-blur rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-400 mb-4 text-center">最近10场比赛得分趋势</h3>
        <div className="h-64">
          {matchHistory.length > 0 ? (
            <Bar ref={barRef} data={barData} options={barOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-amber-300">
              暂无数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
