import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface Task {
  created_at: string;
  credits_used: number;
  status: string;
}

interface UsageChartProps {
  tasks: Task[];
}

export function UsageChart({ tasks }: UsageChartProps) {
  const chartData = useMemo(() => {
    const last6Months: { [key: string]: { month: string; creditos: number; solicitacoes: number } } = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
      last6Months[key] = { month: key, creditos: 0, solicitacoes: 0 };
    }

    // Aggregate task data
    tasks.forEach((task) => {
      const date = new Date(task.created_at);
      const key = date.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
      if (last6Months[key]) {
        last6Months[key].creditos += task.credits_used || 0;
        last6Months[key].solicitacoes += 1;
      }
    });

    return Object.values(last6Months);
  }, [tasks]);

  const chartConfig = {
    creditos: {
      label: 'Créditos',
      theme: {
        light: 'hsl(38, 95%, 55%)',
        dark: 'hsl(38, 95%, 55%)',
      },
    },
    solicitacoes: {
      label: 'Solicitações',
      theme: {
        light: 'hsl(32, 90%, 50%)',
        dark: 'hsl(32, 90%, 50%)',
      },
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCreditos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(38, 95%, 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(38, 95%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="creditos"
            stroke="hsl(38, 95%, 55%)"
            strokeWidth={2}
            fill="url(#colorCreditos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
