
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}

interface DashboardChartProps {
  data: ChartData[];
  currencySymbol?: string;
}

const chartConfig = {
  value: {
    label: 'Amount',
  },
  sales: { // Corresponds to dataKey "Total Sales" if we used that instead of generic "value"
    label: 'Total Sales',
    color: 'hsl(var(--chart-1))',
  },
  received: {
    label: 'Payments Received',
    color: 'hsl(var(--chart-2))',
  },
  pending: {
    label: 'Payments Pending',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function DashboardChart({ data, currencySymbol = '$' }: DashboardChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data available for chart.</div>;
  }
  
  // Map data to include specific keys for chartConfig if needed, or use a generic key like 'value'
  // For this setup, `data` is expected to be like [{ name: "Total Sales", value: 1000, fill: "hsl(...)"}, ...]

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical" // Make it a vertical bar chart (categories on Y, values on X)
          margin={{
            left: 10,
            right: 10,
            top: 10,
            bottom:10,
          }}
        >
          <CartesianGrid horizontal={false} vertical={true} strokeDasharray="3 3" />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value} // Display full name
            className="text-xs"
          />
          <XAxis 
            dataKey="value" 
            type="number" 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(value) => `${currencySymbol}${value.toLocaleString()}`} 
            className="text-xs"
           />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent 
                        indicator="dot" 
                        labelKey='name'
                        formatter={(value, name, item) => (
                            <div className="flex flex-col">
                                <span className="font-medium">{item.payload.name}</span>
                                <span className="text-muted-foreground">{currencySymbol}{Number(value).toFixed(2)}</span>
                            </div>
                        )}
                    />}
          />
           <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="value" layout="vertical" radius={4}>
            {/* Bar component itself will pick up fill from data items */}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

DashboardChart.displayName = 'DashboardChart';
