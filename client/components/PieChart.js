'use client';

import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  Sector
} from 'recharts';
import { useState } from 'react';

export function PieChart({
  data,
  nameKey,
  dataKey,
  tooltipFormatter = (value) => value
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleMouseEnter = (_, index) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Colors for pie slices
  const COLORS = ['#0369a1', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'];

  // Custom shape for active slice
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
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
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="70%"
          innerRadius="40%"
          dataKey={dataKey}
          nameKey={nameKey}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={tooltipFormatter}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            border: '1px solid #eee',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          formatter={(value) => (
            <span style={{ fontSize: '12px', color: '#666' }}>{value}</span>
          )}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}