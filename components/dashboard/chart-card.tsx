"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/theme-context";

interface ChartData {
  [key: string]: string | number;
}

interface ChartCardProps {
  title: string;
  data: ChartData[];
  type: "bar" | "line" | "pie" | "area";
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
  description?: string;
}

interface TooltipEntry {
  color: string;
  name: string;
  value: string | number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  tooltipBg: string;
  tooltipBorder: string;
  textColor: string;
}

function CustomTooltip({ active, payload, label, tooltipBg, tooltipBorder, textColor }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg border shadow-lg p-3"
        style={{
          backgroundColor: tooltipBg,
          borderColor: tooltipBorder,
          backdropFilter: "blur(8px)",
        }}
      >
        <p className="font-semibold text-sm mb-1" style={{ color: textColor }}>
          {label}
        </p>
        {payload.map((entry: TooltipEntry, index: number) => (
          <p key={index} className="text-sm flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span style={{ color: textColor }}>
              {entry.name}: <strong>{entry.value}</strong>
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// Professional color palette with gradients
const DEFAULT_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
];

export function ChartCard({
  title,
  data,
  type,
  dataKey = "value",
  xAxisKey = "name",
  colors = DEFAULT_COLORS,
  description,
}: ChartCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Professional theme-aware colors
  const gridColor = isDark ? "rgba(71, 85, 105, 0.3)" : "rgba(226, 232, 240, 0.8)";
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const tooltipBg = isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";

  const tooltipProps = { tooltipBg, tooltipBorder, textColor };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pb-6">
        <ResponsiveContainer width="100%" height={350}>
          {type === "bar" && (
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                {colors.map((color, index) => (
                  <linearGradient
                    key={`gradient-${index}`}
                    id={`colorGradient${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <Tooltip content={<CustomTooltip {...tooltipProps} />} cursor={{ fill: isDark ? "rgba(51, 65, 85, 0.3)" : "rgba(241, 245, 249, 0.8)" }} />
              <Bar
                dataKey={dataKey}
                fill="url(#colorGradient0)"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          )}
          {type === "area" && (
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <Tooltip content={<CustomTooltip {...tooltipProps} />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={3}
                fill="url(#areaGradient)"
              />
            </AreaChart>
          )}
          {type === "line" && (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <Tooltip content={<CustomTooltip {...tooltipProps} />} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={3}
                dot={{ fill: colors[0], r: 5, strokeWidth: 2, stroke: isDark ? "#1e293b" : "#ffffff" }}
                activeDot={{ r: 7, strokeWidth: 2 }}
              />
            </LineChart>
          )}
          {type === "pie" && (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                  // Type guard for undefined values
                  if (
                    typeof cx !== 'number' ||
                    typeof cy !== 'number' ||
                    typeof midAngle !== 'number' ||
                    typeof innerRadius !== 'number' ||
                    typeof outerRadius !== 'number'
                  ) {
                    return null;
                  }

                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill={isDark ? "#ffffff" : "#1e293b"}
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      className="font-semibold text-xs"
                    >
                      {`${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius={120}
                innerRadius={60}
                paddingAngle={2}
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                    stroke={isDark ? "#1e293b" : "#ffffff"}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip {...tooltipProps} />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
