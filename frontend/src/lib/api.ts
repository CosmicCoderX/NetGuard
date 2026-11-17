import { useEffect, useState } from "react"

export type Prediction = {
    prediction: string
    confidence: number
    risk_level: string
    probabilities: Record<string, number>
    feature_importances: { feature: string; importance: number }[]
}
export type Evaluation = {
    model_name?: string
    macro_precision?: number
    train_rows?: number
    validation_rows?: number
    selection_rule?: string
    comparison?: {
        name: string
        selected: boolean
        test: { accuracy: number; macro_precision: number; macro_f1: number }
        validation: { accuracy: number; macro_precision: number; macro_f1: number }
        single_flow_ms: number
        training_seconds: number
    }[]
    evaluated_at: string
    split: string
    limitations: string[]
    dataset_rows: number
    test_rows: number
    class_counts: Record<string, number>
    accuracy: number
    macro_f1: number
    weighted_f1: number
    classes: string[]
    classification_report: Record<string, { precision: number; recall: number; 'f1-score': number; support: number }>
    confusion_matrix: number[][]
}
export type Metadata = {
    model: string
    features: string[]
    classes: string[]
    sample_counts: Record<string, number>
    evaluation: Evaluation | null
    importance_scope: string
}
export function apiBase() {
    return localStorage.getItem("netguard.api") || "http://127.0.0.1:8000"
}
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const timeout = AbortSignal.timeout(30000)
    const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout
    const response = await fetch(`${apiBase()}${path}`, { ...init, signal })
    const data = await response.json()
    if (!response.ok) {
        const detail = typeof data.detail === "string" ? data.detail : Array.isArray(data.detail)
            ? data.detail.map((item: { msg?: string }) => item.msg || 'Invalid input').join('. ')
            : JSON.stringify(data.detail)
        throw new Error(detail || `Request failed (${response.status})`)
    }
    return data as T
}
const metadataCache = new Map<string, { until: number; request: Promise<Metadata> }>()
export function clearMetadataCache() { metadataCache.clear() }
export function loadMetadata(): Promise<Metadata> {
    const key = apiBase()
    const cached = metadataCache.get(key)
    if (cached && cached.until > Date.now()) return cached.request
    const request = api<Metadata>('/metadata').catch(error => {
        if (metadataCache.get(key)?.request === request) metadataCache.delete(key)
        throw error
    })
    metadataCache.set(key, { until: Date.now() + 60000, request })
    return request
}
export function refreshMetadata() {
    clearMetadataCache()
    window.dispatchEvent(new Event('netguard-refresh'))
}
export function useMetadata() {
    const [data, setData] = useState<Metadata | null>(null)
    const [error, setError] = useState("")
    useEffect(() => {
        let active = true
        let generation = 0
        function load() {
            const current = ++generation
            setData(null); setError('')
            loadMetadata().then(value => { if (active && current === generation) setData(value) })
                .catch(error => { if (active && current === generation) setError(error.message) })
        }
        load()
        window.addEventListener('netguard-settings', load)
        window.addEventListener('netguard-refresh', load)
        return () => {
            active = false
            window.removeEventListener('netguard-settings', load)
            window.removeEventListener('netguard-refresh', load)
        }
    }, [])
    return { data, error }
}
export const percent = (value: number, digits = 2) => `${(value * 100).toFixed(digits)}%`
