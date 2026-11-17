import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { api, apiBase, clearMetadataCache, loadMetadata } from '../src/lib/api.ts'
import { clearHistory, readHistory, savePrediction } from '../src/lib/history.ts'

const originalFetch = globalThis.fetch
beforeEach(() => {
    clearMetadataCache()
    const values = new Map()
    globalThis.localStorage = {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: key => values.delete(key),
    }
})
afterEach(() => { globalThis.fetch = originalFetch })
const prediction = {
    prediction: 'Normal', confidence: 0.95, risk_level: 'Low',
    probabilities: { Normal: 0.95, Botnet: 0.05 }, feature_importances: [],
}

test('new predictions are persisted newest first and bounded to 500 entries', () => {
    for (let i = 0; i < 505; i++) savePrediction({ ...prediction, confidence: i / 1000 }, apiBase())
    const entries = readHistory()
    assert.equal(entries.length, 500)
    assert.equal(entries[0].confidence, 0.504)
    assert.equal(entries[499].confidence, 0.005)
    assert.equal(new Set(entries.map(entry => entry.id)).size, 500)
    assert.equal(entries[0].endpoint, 'http://127.0.0.1:8000')
    clearHistory()
    assert.deepEqual(readHistory(), [])
})

test('invalid or corrupted local history does not break the dashboard', () => {
    for (const value of ['{', '{}', '[null,{},1,"text"]']) {
        localStorage.setItem('netguard.history', value)
        assert.deepEqual(readHistory(), [])
    }
})

test('configured API endpoint is used and request payload is preserved', async () => {
    localStorage.setItem('netguard.api', 'http://localhost:9000')
    globalThis.fetch = async (url, init) => {
        assert.equal(url, 'http://localhost:9000/predict')
        assert.equal(init.method, 'POST')
        assert.equal(init.body, '{"features":{}}')
        assert.ok(init.signal instanceof AbortSignal)
        return new Response(JSON.stringify(prediction), { status: 200 })
    }
    assert.deepEqual(await api('/predict', { method: 'POST', body: '{"features":{}}' }), prediction)
})

test('API validation details become readable errors', async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ detail: [{ msg: 'finite number required' }] }), { status: 422 })
    await assert.rejects(api('/predict'), /finite number required/)
    globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'Missing features' }), { status: 400 })
    await assert.rejects(api('/predict'), /Missing features/)
})

test('unavailable API errors propagate to the UI', async () => {
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
    await assert.rejects(api('/health'), /Failed to fetch/)
})

test('metadata callers share one request and reuse its successful response', async () => {
    let calls = 0
    const metadata = { model: 'XGBoost refined', features: [], classes: [] }
    globalThis.fetch = async () => { calls++; return new Response(JSON.stringify(metadata)) }
    const [first, second] = await Promise.all([loadMetadata(), loadMetadata()])
    assert.deepEqual(first, metadata)
    assert.strictEqual(first, second)
    assert.strictEqual(await loadMetadata(), first)
    assert.equal(calls, 1)
})

test('metadata cache is scoped to the saved API and can be refreshed', async () => {
    const urls = []
    globalThis.fetch = async url => { urls.push(url); return new Response('{"model":"test"}') }
    await loadMetadata()
    localStorage.setItem('netguard.api', 'http://localhost:9000')
    await loadMetadata()
    clearMetadataCache()
    await loadMetadata()
    assert.deepEqual(urls, ['http://127.0.0.1:8000/metadata', 'http://localhost:9000/metadata', 'http://localhost:9000/metadata'])
})

test('failed metadata requests can be retried immediately', async () => {
    let calls = 0
    globalThis.fetch = async () => { if (++calls === 1) throw new TypeError('Offline'); return new Response('{"model":"ready"}') }
    await assert.rejects(loadMetadata(), /Offline/)
    assert.equal((await loadMetadata()).model, 'ready')
    assert.equal(calls, 2)
})

test('API preserves cancellation supplied by a component', async () => {
    const controller = new AbortController()
    controller.abort()
    globalThis.fetch = async (_url, init) => { assert.equal(init.signal.aborted, true); throw init.signal.reason }
    await assert.rejects(api('/sample', { signal: controller.signal }), error => error.name === 'AbortError')
})
