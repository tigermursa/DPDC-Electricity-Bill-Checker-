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

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0];
      return (
        <div className="bg-[#1a1a2e] border border-cyan-500/30 rounded-xl px-4 py-3 shadow-xl">
          <p className="text-gray-400 text-xs">{p.payload.fullDate}</p>
          <p className="text-cyan-400 font-bold text-lg">
            ৳ {p.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#888" fontSize={12} />
          <YAxis stroke="#888" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="bill" fill="#00d4ff" radius={[6, 6, 0, 0]}>
            <LabelList
              dataKey="bill"
              position="top"
              fill="#aaa"
              fontSize={11}
              formatter={(v) => `৳${v.toFixed(0)}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
