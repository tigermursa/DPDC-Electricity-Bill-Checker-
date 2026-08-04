"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

export default function BillBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-8">
        No data to display
      </div>
    );
  }

  // Format data for chart
  const chartData = data
    .slice()
    .reverse()
    .map((item) => ({
      date: new Date(item.checkedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
      bill: item.balance,
      fullDate: new Date(item.checkedAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0];
      return (
        <div className="bg-[#0f0f1a] border border-red-500/40 rounded-xl px-4 py-3 shadow-2xl shadow-red-500/10">
          <p className="text-gray-400 text-xs">{p.payload.fullDate}</p>
          <p className="text-red-400 font-bold text-lg">
            ৳ {p.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 20, left: 0, bottom: 5 }}
        >
          {/* Gradient Definition for Glowing Red */}
          <defs>
            <linearGradient id="redGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff0044" stopOpacity={0.95} />
              <stop offset="50%" stopColor="#ee0033" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#cc0022" stopOpacity={0.7} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />

          <XAxis dataKey="date" stroke="#888" fontSize={12} tickMargin={8} />

          <YAxis
            stroke="#888"
            fontSize={12}
            tickMargin={8}
            tickFormatter={(value) => `৳${value}`}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Red Glowing Bars */}
          <Bar
            dataKey="bill"
            fill="url(#redGlow)"
            stroke="#ff0044"
            strokeWidth={1.5}
            radius={[8, 8, 0, 0]}
            style={{ filter: "drop-shadow(0 0 12px rgba(255, 0, 68, 0.5))" }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill="url(#redGlow)"
                style={{
                  filter: `drop-shadow(0 0 ${10 + index * 0.5}px rgba(255, 0, 68, 0.35))`,
                }}
              />
            ))}
          </Bar>

          {/* ছোট লেবেল (Top of Bar) */}
          <LabelList
            dataKey="bill"
            position="top"
            fill="#ff99aa"
            fontSize={10}
            fontWeight="500"
            formatter={(v) => `৳${v.toFixed(0)}`}
            offset={4}
            style={{ textShadow: "0 0 8px rgba(255, 0, 68, 0.3)" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
