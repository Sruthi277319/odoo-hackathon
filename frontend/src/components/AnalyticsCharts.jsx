import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Custom Glassmorphic Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-glass)',
        padding: '12px 16px',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ fontSize: '12px', color: item.color || item.fill, margin: '4px 0' }}>
            {item.name}: <span style={{ fontWeight: 600 }}>${item.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Line/Area Cost Trend Chart
export const CostTrendChart = ({ data = [], height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} iconType="circle" />
        <Area name="Fuel Cost" type="monotone" dataKey="Fuel" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorFuel)" />
        <Area name="Maintenance" type="monotone" dataKey="Maintenance" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorMaint)" />
        <Area name="Total Spent" type="monotone" dataKey="Total" stroke="#10B981" strokeWidth={1.5} fill="none" strokeDasharray="5 5" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// 2. Bar Expense Chart
export const MonthlyBarChart = ({ data = [], height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
        <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--border-radius-md)',
            color: 'var(--text-main)',
          }}
        />
        <Bar name="Total Expenses" dataKey="Expenses" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} />
          ))}
        </Bar>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};

// 3. Expense Breakdown Pie Chart
export const BreakdownPieChart = ({ data = [], height = 300 }) => {
  const COLORS = ['#6366F1', '#8B5CF6', '#F59E0B', '#06B6D4'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--border-radius-md)',
            color: 'var(--text-main)',
          }}
          formatter={(value) => [`$${value.toLocaleString()}`, 'Total Spent']}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

// 4. Fuel Efficiency Bar Chart
export const EfficiencyBarChart = ({ data = [], height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
        <XAxis dataKey="licensePlate" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--border-radius-md)',
            color: 'var(--text-main)',
          }}
          formatter={(value) => [`${value} KM/L`, 'Avg Efficiency']}
        />
        <Bar name="Efficiency (KM/L)" dataKey="efficiency" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
