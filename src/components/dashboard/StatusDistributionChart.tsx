import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface Task {
  status: string;
}

interface StatusDistributionChartProps {
  tasks: Task[];
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em Progresso',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const statusColors: Record<string, string> = {
  pending: 'hsl(45, 90%, 50%)',
  in_progress: 'hsl(38, 95%, 55%)',
  completed: 'hsl(150, 60%, 45%)',
  cancelled: 'hsl(0, 70%, 50%)',
};

export function StatusDistributionChart({ tasks }: StatusDistributionChartProps) {
  const chartData = useMemo(() => {
    const distribution = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([status, count]) => ({
      status: statusLabels[status] || status,
      count,
      fill: statusColors[status] || 'hsl(220, 10%, 55%)',
    }));
  }, [tasks]);

  const chartConfig = {
    count: {
      label: 'Quantidade',
      theme: {
        light: 'hsl(38, 95%, 55%)',
        dark: 'hsl(38, 95%, 55%)',
      },
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        Sem dados suficientes
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="status" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
