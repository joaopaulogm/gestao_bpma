
import React from 'react';

// Chart colors following site identity - navy, yellow accent, complementary
export const CHART_COLORS = [
  'hsl(220, 83%, 16%)',    // Navy blue (primary)
  'hsl(48, 100%, 50%)',    // Yellow (accent)
  'hsl(142, 76%, 36%)',    // Green (success)
  'hsl(220, 60%, 35%)',    // Medium blue
  'hsl(48, 90%, 60%)',     // Light yellow
  'hsl(142, 60%, 50%)',    // Light green
  'hsl(220, 40%, 50%)',    // Slate blue
  'hsl(25, 90%, 55%)',     // Orange
];

// Custom tooltip component for charts
export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm p-3 border border-border rounded-xl shadow-lg">
        <p className="font-semibold text-sm mb-1.5 text-foreground">{label || payload[0]?.name}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm text-muted-foreground flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full inline-block" 
              style={{ backgroundColor: item.color }}
            />
            <span className="font-bold text-foreground">{item.value?.toLocaleString('pt-BR')}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom label renderer for pie charts
export const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Hide labels for small slices

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize={11}
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
