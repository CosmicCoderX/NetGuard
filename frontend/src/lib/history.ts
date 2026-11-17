import type { Prediction } from "./api"

export type HistoryEntry = Prediction & { id: string; timestamp: string; endpoint: string }
const key = "netguard.history"
export function readHistory(): HistoryEntry[] {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]")
        return Array.isArray(value) ? value.filter((entry): entry is HistoryEntry =>
            entry !== null && typeof entry === 'object' &&
            typeof entry.id === 'string' && typeof entry.timestamp === 'string' &&
            Number.isFinite(Date.parse(entry.timestamp)) && typeof entry.prediction === 'string' &&
            typeof entry.confidence === 'number' && Number.isFinite(entry.confidence) &&
            entry.confidence >= 0 && entry.confidence <= 1 &&
            ['Low', 'High', 'Critical'].includes(entry.risk_level) && typeof entry.endpoint === 'string'
        ).slice(0, 500) : []
    } catch { return [] }
}
export function savePrediction(prediction: Prediction, endpoint: string) {
    const entry = { ...prediction, id: crypto.randomUUID(), timestamp: new Date().toISOString(), endpoint }
    localStorage.setItem(key, JSON.stringify([entry, ...readHistory()].slice(0, 500)))
}
export function clearHistory() { localStorage.removeItem(key) }
