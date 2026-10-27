import {
    Activity,
    BrainCircuit,
    ShieldAlert,
    Target,
} from "lucide-react"

import TrafficDistribution from "../components/charts/TrafficDistribution"
import ModelPerformance from "../components/charts/ModelPerformance"

const stats = [
    {
        title: "Network Flows",
        value: "2.52M",
        description: "Production dataset flows",
        icon: Activity,
    },
    {
        title: "Threat Classes",
        value: "6",
        description: "Production classifications",
        icon: ShieldAlert,
    },
    {
        title: "Model Accuracy",
        value: "99.91%",
        description: "Final XGBoost test accuracy",
        icon: Target,
    },
    {
        title: "Production Model",
        value: "XGBoost",
        description: "Selected final model",
        icon: BrainCircuit,
    },
]

function Overview() {
    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <p className="text-sm text-slate-500">
                    Overview
                </p>

                <h1 className="mt-1 text-2xl font-semibold text-white">
                    Network security intelligence
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                    Monitor network traffic classifications and explore
                    NetGuard's machine learning performance.
                </p>
            </div>


            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                {stats.map((stat) => {
                    const Icon = stat.icon

                    return (
                        <div
                            key={stat.title}
                            className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
                                <Icon className="h-4 w-4 text-sky-400" />
                            </div>

                            <p className="mt-5 text-sm text-slate-500">
                                {stat.title}
                            </p>

                            <p className="mt-1 text-2xl font-semibold text-white">
                                {stat.value}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {stat.description}
                            </p>
                        </div>
                    )
                })}

            </div>


            {/* Analytics */}
            <div className="grid gap-6 lg:grid-cols-2">

                {/* Traffic Distribution */}
                <TrafficDistribution />


                {/* Model Performance */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">

                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-slate-100">
                            Model Performance
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Comparison of NetGuard's evaluated machine learning models.
                        </p>
                    </div>

                    <ModelPerformance />

                </div>

            </div>


            {/* Recent Predictions */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

                <div className="flex items-start justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-100">
                            Recent Predictions
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Latest traffic analyzed by the NetGuard API.
                        </p>
                    </div>

                    <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                        Latest
                    </span>

                </div>


                <div className="mt-5 overflow-hidden rounded-xl border border-slate-800">

                    {/* Table Header */}
                    <div className="hidden grid-cols-12 border-b border-slate-800 bg-slate-950 px-4 py-3 text-[10px] uppercase tracking-wider text-slate-600 sm:grid">

                        <div className="col-span-5">
                            Prediction
                        </div>

                        <div className="col-span-3">
                            Confidence
                        </div>

                        <div className="col-span-2">
                            Risk
                        </div>

                        <div className="col-span-2 text-right">
                            Source
                        </div>

                    </div>


                    {/* Normal Prediction */}
                    <div className="grid grid-cols-1 gap-3 border-b border-slate-800 bg-slate-950/60 px-4 py-4 sm:grid-cols-12 sm:items-center">

                        <div className="sm:col-span-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Normal
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        BENIGN network flow
                                    </p>
                                </div>

                            </div>

                        </div>


                        <div className="sm:col-span-3">

                            <p className="text-[10px] uppercase tracking-wide text-slate-600 sm:hidden">
                                Confidence
                            </p>

                            <p className="mt-1 text-sm font-semibold text-emerald-400 sm:mt-0">
                                99.9999%
                            </p>

                        </div>


                        <div className="sm:col-span-2">

                            <p className="text-[10px] uppercase tracking-wide text-slate-600 sm:hidden">
                                Risk
                            </p>

                            <p className="mt-1 text-sm text-slate-300 sm:mt-0">
                                Low
                            </p>

                        </div>


                        <div className="sm:col-span-2 sm:text-right">

                            <p className="text-[10px] uppercase tracking-wide text-slate-600 sm:hidden">
                                Source
                            </p>

                            <p className="mt-1 text-xs text-slate-500 sm:mt-0">
                                CIC-IDS2017
                            </p>

                        </div>

                    </div>


                    {/* DoS / DDoS Prediction */}
                    <div className="grid grid-cols-1 gap-3 bg-slate-950/60 px-4 py-4 sm:grid-cols-12 sm:items-center">

                        <div className="sm:col-span-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                                    <div className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        DoS / DDoS
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        DDoS network flow
                                    </p>
                                </div>

                            </div>

                        </div>


                        <div className="sm:col-span-3">

                            <p className="text-[10px] uppercase tracking-wide text-slate-600 sm:hidden">
                                Confidence
                            </p>

                            <p className="mt-1 text-sm font-semibold text-orange-400 sm:mt-0">
                                99.9999%
                            </p>

                        </div>


                        <div className="sm:col-span-2">

                            <p className="text-[10px] uppercase tracking-wide text-slate-600 sm:hidden">
                                Risk
                            </p>

                            <p className="mt-1 text-sm text-slate-300 sm:mt-0">
                                High
                            </p>

                        </div>


                        <div className="sm:col-span-2 sm:text-right">

                            <p className="text-[10px] uppercase tracking-wide text-slate-600 sm:hidden">
                                Source
                            </p>

                            <p className="mt-1 text-xs text-slate-500 sm:mt-0">
                                CIC-IDS2017
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Overview