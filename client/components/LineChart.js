'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';

export function LineChart({
  data,
  xAxis,
  yAxis,
  yAxisLabel,
  tooltipTitle = '',
  tooltipFormatter = (value) => value
}) {
  // Format data for date fields
  const formattedData = useMemo(() => {
    if (!data || !Array.isArray(data) || !data.length) return [];

    return data.map(item => {
      const newItem = { ...item };
      // Convert date strings to formatted dates for display
      if (xAxis && typeof item[xAxis] === 'string' && item[xAxis].includes('-')) {
        try {
          const dateObj = parseISO(item[xAxis]);
          newItem.formattedDate = format(dateObj, 'MMM dd');
        } catch (e) {
          newItem.formattedDate = item[xAxis];
        }
      }
      return newItem;
    });
  }, [data, xAxis]);

  if (!data || !Array.isArray(data) || !data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={formattedData}
        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey={formattedData[0]?.formattedDate ? "formattedDate" : xAxis} 
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
          labelFormatter={(value) => `Date: ${value}`}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            border: '1px solid #eee',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey={yAxis}
          name={tooltipTitle}
          stroke="#0369a1"
          strokeWidth={2}
          activeDot={{ r: 6 }}
          dot={{ strokeWidth: 2, r: 4 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}