import { useEffect, useRef, useState } from 'react'
import { Check, Link2, LoaderCircle } from 'lucide-react'
import { api, apiBase, clearMetadataCache } from '../lib/api'
import { Notice, PageHeader } from '../components/ui'
import WhyCard from '../components/WhyCard'

export default function Settings() {
    const [endpoint, setEndpoint] = useState(apiBase)
    const [savedEndpoint, setSavedEndpoint] = useState(apiBase)
    const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null)
    const [busy, setBusy] = useState(false)
    const controller = useRef<AbortController | null>(null)
    const mounted = useRef(true)
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort() } }, [])
    function save() {
        try {
            const url = new URL(endpoint.trim())
            if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Use an HTTP(S) URL without credentials, query parameters, or fragments.')
            const value = url.toString().replace(/\/+$/, '')
            localStorage.setItem('netguard.api', value); clearMetadataCache()
            setSavedEndpoint(value); setEndpoint(value)
            window.dispatchEvent(new Event('netguard-settings'))
            setMessage({ text: 'API endpoint saved.', good: true })
        } catch (error) { setMessage({ text: error instanceof Error ? error.message : 'Couldn’t save the endpoint.', good: false }) }
    }
    async function test() {
        setBusy(true); setMessage(null)
        controller.current?.abort(); controller.current = new AbortController()
        try {
            const health = await api<{ status: string; model_loaded: boolean }>('/health', { signal: controller.current.signal })
            const good = health.status === 'healthy' && health.model_loaded
            if (mounted.current) setMessage({ text: good ? 'Connected. The model is ready.' : 'The API responded, but the model is unavailable.', good })
        } catch { if (mounted.current) setMessage({ text: 'Couldn’t connect. Check the saved address and make sure the backend is running.', good: false }) }
        finally { if (mounted.current) setBusy(false) }
    }
    const changed = endpoint.trim().replace(/\/+$/, '') !== savedEndpoint
    return <div className="page settings-width">
        <PageHeader eyebrow="Preferences" title="Settings" description="Connect your dashboard to the prediction service." />
        <section className="panel panel-body"><div className="settings-section"><div><h2>API connection</h2><p>Where flow measurements are sent for analysis.</p></div><div><label className="field-label" htmlFor="api-endpoint">API base URL</label><input id="api-endpoint" type="url" className="field" value={endpoint} onChange={event => setEndpoint(event.target.value)} placeholder="http://127.0.0.1:8000" disabled={busy} /><p className="field-hint">{changed ? 'Unsaved changes. Save before testing this address.' : 'This address is saved in your browser.'}</p><div className="row" style={{ marginTop: 18 }}><button className="btn btn-primary" onClick={save} disabled={busy || !changed}><Check size={14} />Save changes</button><button className="btn btn-secondary" onClick={test} disabled={busy || changed}>{busy ? <LoaderCircle size={14} className="spin" /> : <Link2 size={14} />}{busy ? 'Testing…' : 'Test connection'}</button></div>{message && <div style={{ marginTop: 16 }}><Notice tone={message.good ? 'success' : 'error'}>{message.text}</Notice></div>}</div></div><WhyCard title="Connection help">The backend must allow this frontend address through CORS. If the status is offline, verify the saved API URL and that the backend is running. An HTTPS dashboard needs an HTTPS backend.</WhyCard></section>
        <section className="panel panel-body"><div className="panel-heading" style={{ marginBottom: 10 }}><h2>Workspace details</h2><span className="badge">Local</span></div><div className="preference-row"><div><strong>Prediction history</strong><p>Up to 500 results, stored in this browser.</p></div><span className="small muted">Browser storage</span></div><div className="preference-row"><div><strong>Risk levels</strong><p>Assigned by the predicted traffic category.</p></div><span className="badge">Model policy</span></div><WhyCard title="About model confidence">Risk levels are fixed class categories. Confidence reflects model probabilities and is not a guarantee of correctness on unfamiliar traffic.</WhyCard></section>
    </div>
}
