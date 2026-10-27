import { useState } from "react"
import {
    Activity,
    ArrowRight,
    Network,
    RefreshCw,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react"

import {
    networkFeatures,
    type FeatureGroup,
} from "../data/features"


const featureGroups: FeatureGroup[] = [
    "Flow Information",
    "Packet Statistics",
    "Forward Traffic",
    "Backward Traffic",
    "Flags & Headers",
    "Timing & Activity",
]


const trafficTypes = [
    "Normal",
    "DoS / DDoS",
    "Port Scanning",
    "Brute Force",
    "Web Attack",
    "Botnet",
]


const API_BASE_URL = "http://127.0.0.1:8000"


type PredictionResult = {
    prediction: string
    confidence: number
    risk_level: string
    probabilities: Record<string, number>
}


function AnalyzeTraffic() {

    const [features, setFeatures] = useState<Record<string, string>>({})
    const [trafficType, setTrafficType] = useState("Normal")

    const [isGenerating, setIsGenerating] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const [error, setError] = useState("")
    const [prediction, setPrediction] = useState<PredictionResult | null>(null)


    const handleFeatureChange = (
        featureName: string,
        value: string,
    ) => {
        setFeatures((current) => ({
            ...current,
            [featureName]: value,
        }))
    }


    const handleGenerateData = async () => {

        setIsGenerating(true)
        setError("")
        setPrediction(null)

        try {

            const response = await fetch(
                `${API_BASE_URL}/sample?traffic_type=${encodeURIComponent(trafficType)}`
            )

            if (!response.ok) {
                throw new Error("Failed to generate traffic data.")
            }

            const data = await response.json()

            const generatedFeatures: Record<string, string> = {}

            Object.entries(data.features).forEach(
                ([featureName, value]) => {
                    generatedFeatures[featureName] = String(value)
                }
            )

            setFeatures(generatedFeatures)

        } catch (error) {

            console.error(error)

            setError(
                "Unable to generate traffic data. Make sure the backend is running."
            )

        } finally {

            setIsGenerating(false)

        }
    }


    const handleAnalyzeTraffic = async () => {

        setError("")
        setPrediction(null)

        // Make sure all 78 features have values
        const missingFeatures = networkFeatures.filter(
            (feature) =>
                features[feature.name] === undefined ||
                features[feature.name] === ""
        )

        if (missingFeatures.length > 0) {

            setError(
                `Please generate data or fill all ${networkFeatures.length} features before analyzing.`
            )

            return
        }


        setIsAnalyzing(true)

        try {

            const numericFeatures: Record<string, number> = {}

            networkFeatures.forEach((feature) => {

                const value = Number(features[feature.name])

                if (!Number.isFinite(value)) {
                    throw new Error(
                        `Invalid value for ${feature.label}.`
                    )
                }

                numericFeatures[feature.name] = value

            })


            const response = await fetch(
                `${API_BASE_URL}/predict`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        features: numericFeatures,
                    }),
                }
            )


            const data = await response.json()


            if (!response.ok) {
                throw new Error(
                    data.detail || "Prediction request failed."
                )
            }


            setPrediction(data)

        } catch (error) {

            console.error(error)

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to analyze traffic."
            )

        } finally {

            setIsAnalyzing(false)

        }
    }


    const formatConfidence = (value: number) => {
        return `${(value * 100).toFixed(2)}%`
    }


    const formatProbability = (value: number) => {
        return `${(value * 100).toFixed(2)}%`
    }


    const getRiskClasses = (risk: string) => {

        if (risk === "Low") {
            return {
                container:
                    "border-emerald-500/20 bg-emerald-500/5",
                icon:
                    "bg-emerald-500/10 text-emerald-400",
                text:
                    "text-emerald-400",
            }
        }

        if (risk === "High") {
            return {
                container:
                    "border-amber-500/20 bg-amber-500/5",
                icon:
                    "bg-amber-500/10 text-amber-400",
                text:
                    "text-amber-400",
            }
        }

        return {
            container:
                "border-red-500/20 bg-red-500/5",
            icon:
                "bg-red-500/10 text-red-400",
            text:
                "text-red-400",
        }
    }


    const riskClasses = prediction
        ? getRiskClasses(prediction.risk_level)
        : null


    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <p className="text-sm text-slate-500">
                    Analyze Traffic
                </p>

                <h1 className="mt-1 text-2xl font-semibold text-white">
                    Network traffic analysis
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                    Generate a realistic network flow or inspect its
                    78 features before sending it to the production model.
                </p>
            </div>


            {/* Model Status */}
            <div className="flex items-center gap-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
                    <ShieldCheck className="h-5 w-5 text-sky-400" />
                </div>

                <div>
                    <p className="text-sm font-medium text-sky-300">
                        XGBoost production model
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                        99.91% test accuracy · 6 traffic classifications
                    </p>
                </div>

            </div>


            {/* Main Content */}
            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">


                {/* Input Panel */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

                    <div className="flex items-start justify-between gap-4">

                        <div className="flex items-start gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                                <Network className="h-4 w-4 text-sky-400" />
                            </div>

                            <div>
                                <h2 className="font-medium text-white">
                                    Network Flow Features
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Generate realistic CIC-IDS2017 traffic
                                    or edit the generated values manually.
                                </p>
                            </div>

                        </div>


                        <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                            {networkFeatures.length} features
                        </span>

                    </div>


                    {/* Generate Data Controls */}
                    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">

                        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">

                            <div>

                                <label
                                    htmlFor="traffic-type"
                                    className="block text-xs font-medium text-slate-400"
                                >
                                    Traffic category
                                </label>

                                <select
                                    id="traffic-type"
                                    value={trafficType}
                                    onChange={(event) =>
                                        setTrafficType(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                                >
                                    {trafficTypes.map((type) => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>
                                    ))}
                                </select>

                            </div>


                            <div className="flex items-end">

                                <button
                                    type="button"
                                    onClick={handleGenerateData}
                                    disabled={isGenerating || isAnalyzing}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:border-sky-500/50 hover:bg-sky-500/15 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >

                                    <RefreshCw
                                        className={`h-4 w-4 ${isGenerating
                                            ? "animate-spin"
                                            : ""
                                            }`}
                                    />

                                    {isGenerating
                                        ? "Generating..."
                                        : "Generate Data"}

                                </button>

                            </div>

                        </div>


                        {error && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">

                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                                <p className="text-xs leading-5 text-red-400">
                                    {error}
                                </p>

                            </div>
                        )}

                    </div>


                    {/* Feature Groups */}
                    <div className="mt-6 space-y-6">

                        {featureGroups.map((group) => {

                            const groupFeatures = networkFeatures.filter(
                                (feature) => feature.group === group
                            )


                            return (
                                <div
                                    key={group}
                                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                                >

                                    <div className="mb-5 flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
                                            <Activity className="h-4 w-4 text-slate-400" />
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-slate-200">
                                                {group}
                                            </h3>

                                            <p className="mt-0.5 text-xs text-slate-600">
                                                {groupFeatures.length} features
                                            </p>
                                        </div>

                                    </div>


                                    <div className="grid gap-4 sm:grid-cols-2">

                                        {groupFeatures.map((feature) => (

                                            <div key={feature.name}>

                                                <label
                                                    htmlFor={feature.name}
                                                    className="block text-xs font-medium text-slate-400"
                                                >
                                                    {feature.label}
                                                </label>


                                                <input
                                                    id={feature.name}
                                                    type="number"
                                                    step="any"
                                                    value={
                                                        features[feature.name] ?? ""
                                                    }
                                                    onChange={(event) =>
                                                        handleFeatureChange(
                                                            feature.name,
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter value"
                                                    title={feature.description}
                                                    className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                                                />

                                            </div>

                                        ))}

                                    </div>

                                </div>
                            )
                        })}

                    </div>


                    {/* Analyze Button */}
                    <button
                        type="button"
                        onClick={handleAnalyzeTraffic}
                        disabled={isAnalyzing || isGenerating}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {isAnalyzing ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Analyze Traffic
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}

                    </button>

                </div>


                {/* Result Panel */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

                    <div>
                        <h2 className="font-medium text-white">
                            Prediction Result
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            XGBoost classification output
                        </p>
                    </div>


                    {!prediction ? (

                        <div className="mt-8 flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/50 text-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                                <ShieldCheck className="h-5 w-5 text-slate-600" />
                            </div>

                            <p className="mt-4 text-sm font-medium text-slate-400">
                                No traffic analyzed yet
                            </p>

                            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-600">
                                Generate a traffic flow, review its features,
                                and run an analysis to see the predicted
                                category and risk level.
                            </p>

                        </div>

                    ) : (

                        <div className="mt-6 space-y-4">

                            {/* Prediction */}
                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                                    Predicted Category
                                </p>

                                <div className="mt-3 flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                                        <CheckCircle2 className="h-5 w-5 text-sky-400" />
                                    </div>

                                    <p className="text-xl font-semibold text-white">
                                        {prediction.prediction}
                                    </p>

                                </div>

                            </div>


                            {/* Confidence + Risk */}
                            <div className="grid grid-cols-2 gap-4">

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                        Confidence
                                    </p>

                                    <p className="mt-2 text-lg font-semibold text-sky-400">
                                        {formatConfidence(
                                            prediction.confidence
                                        )}
                                    </p>

                                </div>


                                <div
                                    className={`rounded-xl border p-4 ${riskClasses?.container}`}
                                >

                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                        Risk Level
                                    </p>

                                    <p
                                        className={`mt-2 text-lg font-semibold ${riskClasses?.text}`}
                                    >
                                        {prediction.risk_level}
                                    </p>

                                </div>

                            </div>


                            {/* Probabilities */}
                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                                    Class Probabilities
                                </p>

                                <div className="mt-4 space-y-3">

                                    {Object.entries(prediction.probabilities)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([className, probability]) => (

                                            <div key={className}>

                                                <div className="mb-1.5 flex items-center justify-between gap-3">

                                                    <p className="truncate text-xs text-slate-400">
                                                        {className}
                                                    </p>

                                                    <p className="shrink-0 text-xs font-medium text-slate-300">
                                                        {formatProbability(
                                                            probability
                                                        )}
                                                    </p>

                                                </div>

                                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

                                                    <div
                                                        className="h-full rounded-full bg-sky-400 transition-all duration-500"
                                                        style={{
                                                            width: `${Math.max(
                                                                probability * 100,
                                                                0.5
                                                            )}%`,
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        ))}

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    )
}


export default AnalyzeTraffic