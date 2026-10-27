import {
    CheckCircle2,
    Trophy,
} from "lucide-react"

const models = [
    {
        name: "XGBoost",
        accuracy: "99.91%",
        macroF1: "96.61%",
        status: "Production",
        best: true,
    },
    {
        name: "Random Forest",
        accuracy: "99.88%",
        macroF1: "96.00%",
        status: "Evaluated",
        best: false,
    },
    {
        name: "Logistic Regression",
        accuracy: "—",
        macroF1: "—",
        status: "To be evaluated",
        best: false,
    },
]

function ModelPerformance() {
    return (
        <div className="space-y-3">

            {/* Table Header */}
            <div className="hidden items-center justify-between px-4 text-[10px] uppercase tracking-wider text-slate-600 sm:flex">
                <p>Model</p>

                <div className="flex gap-10">
                    <p className="w-16 text-right">Accuracy</p>
                    <p className="w-16 text-right">Macro F1</p>
                </div>
            </div>


            {/* Models */}
            {models.map((model) => (
                <div
                    key={model.name}
                    className={`rounded-xl border p-4 transition-all duration-200 ${model.best
                            ? "border-sky-500/30 bg-sky-500/5"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                >
                    <div className="flex items-center justify-between gap-4">

                        {/* Model Information */}
                        <div className="flex min-w-0 items-center gap-3">

                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${model.best
                                        ? "bg-sky-500/10"
                                        : "bg-slate-800"
                                    }`}
                            >
                                {model.best ? (
                                    <Trophy className="h-4 w-4 text-sky-400" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                                )}
                            </div>

                            <div className="min-w-0">

                                <div className="flex items-center gap-2">

                                    <p className="truncate text-sm font-medium text-white">
                                        {model.name}
                                    </p>

                                    {model.best && (
                                        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                                            Best
                                        </span>
                                    )}

                                </div>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {model.status}
                                </p>

                            </div>

                        </div>


                        {/* Metrics */}
                        <div className="flex shrink-0 gap-5 text-right sm:gap-8">

                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-slate-600 sm:hidden">
                                    Acc.
                                </p>

                                <p className="hidden text-[10px] uppercase tracking-wide text-slate-600 sm:block">
                                    Accuracy
                                </p>

                                <p
                                    className={`mt-1 text-sm font-semibold ${model.best
                                            ? "text-sky-400"
                                            : "text-white"
                                        }`}
                                >
                                    {model.accuracy}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                    Macro F1
                                </p>

                                <p
                                    className={`mt-1 text-sm font-semibold ${model.best
                                            ? "text-sky-400"
                                            : "text-white"
                                        }`}
                                >
                                    {model.macroF1}
                                </p>
                            </div>

                        </div>

                    </div>
                </div>
            ))}


            {/* Footer */}
            <div className="pt-2">
                <p className="text-xs text-slate-600">
                    XGBoost selected based on overall production evaluation.
                </p>
            </div>

        </div>
    )
}

export default ModelPerformance