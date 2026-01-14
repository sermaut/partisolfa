import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';

interface Task {
  service_type: string;
}

interface ServiceDistributionChartProps {
  tasks: Task[];
}

const COLORS = ['hsl(38, 95%, 55%)', 'hsl(32, 90%, 50%)'];

export function ServiceDistributionChart({ tasks }: ServiceDistributionChartProps) {
  const chartData = useMemo(() => {
    const distribution = tasks.reduce((acc, task) => {
      const type = task.service_type === 'arranjo' ? 'Arranjos' : 'Aperfeiçoamentos';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, [tasks]);

  const chartConfig = {
    Arranjos: {
      label: 'Arranjos',
      color: 'hsl(38, 95%, 55%)',
    },
    Aperfeiçoamentos: {
      label: 'Aperfeiçoamentos',
      color: 'hsl(32, 90%, 50%)',
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
