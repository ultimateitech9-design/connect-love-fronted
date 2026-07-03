"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
 data: any[];
}

export default function AdminRevenueChart({ data }: Props) {
 return (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.32} />
 <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.04} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
 <XAxis dataKey="m" stroke="#64748b" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} dy={8} />
 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={54} tickFormatter={(v) => `$${Number(v).toLocaleString()}`} />
 <Tooltip
 formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
 contentStyle={{ background: "rgba(255, 255, 255, 0.96)", border: "1px solid #ffe4e6", borderRadius: 12, boxShadow: "0 12px 24px rgba(244,63,94,0.12)", color: "#0f172a", fontWeight: 700 }}
 />
 <Area type="monotone" dataKey="rev" stroke="#f43f5e" strokeWidth={3} fill="url(#rev)" dot={{ r: 4, fill: "#fff", stroke: "#f43f5e", strokeWidth: 2 }} activeDot={{ r: 6 }} />
 </AreaChart>
 </ResponsiveContainer>
 );
}
