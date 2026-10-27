import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

const trafficData = [
    { category: "Normal", count: 2096484 },
    { category: "DoS / DDoS", count: 321764 },
    { category: "Port Scanning", count: 90819 },
    { category: "Brute Force", count: 9152 },
    { category: "Web Attack", count: 2143 },
    { category: "Botnet", count: 1953 },
]

function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US").format(value)
}

export default function TrafficDistribution() {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-100">
                    Traffic Distribution
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Distribution of network flows across production traffic categories.
                </p>
            </div>

            <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={trafficData}
                        layout="vertical"
                        margin={{
                            top: 5,
                            right: 25,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke="#334155"
                        />

                        <XAxis
                            type="number"
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) =>
                                new Intl.NumberFormat("en-US", {
                                    notation: "compact",
                                    maximumFractionDigits: 1,
                                }).format(value)
                            }
                        />

                        <YAxis
                            type="category"
                            dataKey="category"
                            width={105}
                            tick={{ fill: "#cbd5e1", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                            contentStyle={{
                                backgroundColor: "#0f172a",
                                border: "1px solid #334155",
                                borderRadius: "12px",
                                color: "#e2e8f0",
                            }}
                            formatter={(value) => [
                                formatNumber(Number(value)),
                                "Flows",
                            ]}
                        />

                        <Bar
                            dataKey="count"
                            name="Traffic"
                            fill="#38bdf8"
                            radius={[0, 6, 6, 0]}
                            barSize={28}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}