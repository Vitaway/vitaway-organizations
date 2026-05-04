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

// ===============================
// Custom Bar Component
// ===============================
function CustomBar({ colors, ...props }: any) {
  const { x, y, width, height, index } = props;

  const color = colors[index % colors.length];

  return (
    <g>
      <defs>
        <linearGradient
          id={`barGradient-${index}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.95} />
          <stop offset="100%" stopColor={color} stopOpacity={0.65} />
        </linearGradient>
      </defs>

      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#barGradient-${index})`}
        rx={10}
        ry={10}
      />
    </g>
  );
}

// ===============================
// Custom Tooltip
// ===============================
function CustomTooltip({
  active,
  payload,
  label,
  tooltipBg,
  tooltipBorder,
  textColor,
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl border shadow-xl p-3"
        style={{
          backgroundColor: tooltipBg,
          borderColor: tooltipBorder,
          backdropFilter: "blur(10px)",
        }}
      >
        <p
          className="font-semibold text-sm mb-2"
          style={{ color: textColor }}
        >
          {label}
        </p>

        {payload.map((entry: TooltipEntry, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />

            <span style={{ color: textColor }}>
              {entry.name}: <strong>{entry.value}</strong>
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ===============================
// Default Colors
// ===============================
const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

// ===============================
// Main Component
// ===============================
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

  const gridColor = isDark
    ? "rgba(71, 85, 105, 0.3)"
    : "rgba(226, 232, 240, 0.8)";

  const textColor = isDark ? "#cbd5e1" : "#475569";

  const tooltipBg = isDark
    ? "rgba(30, 41, 59, 0.95)"
    : "rgba(255, 255, 255, 0.95)";

  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";

  const tooltipProps = {
    tooltipBg,
    tooltipBorder,
    textColor,
  };

  return (
    <Card className="overflow-hidden border-0 shadow-none hover:shadow-none rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>

        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pb-6">
        <ResponsiveContainer width="100%" height={350}>
          {/* ===================== BAR CHART ===================== */}
          {type === "bar" && (
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />

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

              <Tooltip
                content={<CustomTooltip {...tooltipProps} />}
                cursor={{
                  fill: isDark
                    ? "rgba(51, 65, 85, 0.25)"
                    : "rgba(241, 245, 249, 0.8)",
                }}
              />

              <Bar
                dataKey={dataKey}
                maxBarSize={60}
                shape={(props: any) => (
                  <CustomBar {...props} colors={colors} />
                )}
              />
            </BarChart>
          )}

          {/* ===================== AREA CHART ===================== */}
          {type === "area" && (
            <AreaChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="areaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={colors[0]}
                    stopOpacity={0.35}
                  />

                  <stop
                    offset="95%"
                    stopColor={colors[0]}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />

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

          {/* ===================== LINE CHART ===================== */}
          {type === "line" && (
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />

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
                dot={{
                  fill: colors[0],
                  r: 5,
                  strokeWidth: 2,
                  stroke: isDark ? "#1e293b" : "#ffffff",
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          )}

          {/* ===================== PIE CHART ===================== */}
          {type === "pie" && (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                paddingAngle={3}
                dataKey={dataKey}
                label={({
                  name,
                  percent,
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                }) => {
                  if (
                    typeof cx !== "number" ||
                    typeof cy !== "number" ||
                    typeof midAngle !== "number" ||
                    typeof innerRadius !== "number" ||
                    typeof outerRadius !== "number"
                  ) {
                    return null;
                  }

                  const RADIAN = Math.PI / 180;

                  const radius =
                    innerRadius +
                    (outerRadius - innerRadius) * 0.5;

                  const x =
                    cx + radius * Math.cos(-midAngle * RADIAN);

                  const y =
                    cy + radius * Math.sin(-midAngle * RADIAN);

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
              >
                {data.map((_, index) => (
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