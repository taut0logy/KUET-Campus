'use client';

import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

export function BarChart({
  data,
  xAxis,
  yAxis,
  yAxisLabel,
  tooltipTitle = '',
  tooltipFormatter = (value) => value
}) {
  // Generate colors for bars
  const getBarColor = (index) => {
    const colors = [
      '#0369a1', // Blue
      '#0891b2', // Cyan
      '#0ea5e9', // Sky
      '#38bdf8', // Lighter sky
      '#7dd3fc'  // Lightest sky
    ];
    return colors[index % colors.length];
  };

  if (!data || !Array.isArray(data) || !data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
        barSize={30}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
        <XAxis 
          dataKey={xAxis}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#888' }}
          axisLine={{ stroke: '#888' }}
        />
        <YAxis 
          label={{ 
            value: yAxisLabel, 
            angle: -90, 
            position: 'insideLeft', 
            style: { textAnchor: 'middle' },
            dx: -15
          }}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#888' }}
          axisLine={{ stroke: '#888' }}
        />
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={(value) => `${xAxis.charAt(0).toUpperCase() + xAxis.slice(1)}: ${value}`}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            border: '1px solid #eee',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
        <Bar
          dataKey={yAxis}
          name={tooltipTitle}
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(index)} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}