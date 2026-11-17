import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, LoaderCircle, RefreshCw, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { api, apiBase, percent, useMetadata, type Prediction } from '../lib/api'
import { savePrediction } from '../lib/history'
import { networkFeatures, type FeatureGroup } from '../data/features'
import { EmptyState, Notice, PageHeader, RiskBadge } from '../components/ui'
import WhyCard from '../components/WhyCard'

const groups: FeatureGroup[] = ['Flow Information', 'Packet Statistics', 'Forward Traffic', 'Backward Traffic', 'Flags & Headers', 'Timing & Activity']
const groupedFeatures = groups.map(name => ({ name, fields: networkFeatures.filter(feature => feature.group === name) }))
const trafficTypes = ['Normal', 'DoS / DDoS', 'Port Scanning', 'Brute Force', 'Web Attack', 'Botnet']

export default function AnalyzeTraffic() {
    const { data: metadata } = useMetadata()
    const [features, setFeatures] = useState<Record<string, string>>({})
    const [trafficType, setTrafficType] = useState('Normal')
    const [busy, setBusy] = useState<'sample' | 'predict' | null>(null)
    const [error, setError] = useState('')
    const [warning, setWarning] = useState('')
    const [prediction, setPrediction] = useState<Prediction | null>(null)
    const [search, setSearch] = useState('')
    const [invalid, setInvalid] = useState<string[]>([])
    const [expanded, setExpanded] = useState<string[]>([])
    const controller = useRef<AbortController | null>(null)
    const mounted = useRef(true)
    const result = useRef<HTMLElement>(null)
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort() } }, [])
    const filled = useMemo(() => networkFeatures.filter(feature => features[feature.name]?.trim()).length, [features])
    const visible = useMemo(() => groupedFeatures.map(group => ({ ...group, fields: group.fields.filter(feature => `${feature.name} ${feature.label}`.toLowerCase().includes(search.trim().toLowerCase())) })).filter(group => group.fields.length), [search])
    const invalidSet = useMemo(() => new Set(invalid), [invalid])
    function change(name: string, value: string) {
        setFeatures(current => ({ ...current, [name]: value })); setPrediction(null); setWarning('')
        setInvalid(current => current.filter(field => field !== name))
    }
    async function generate() {
        if (busy) return
        setBusy('sample'); setError(''); setWarning(''); setPrediction(null); setInvalid([]); setExpanded([]); setSearch('')
        controller.current?.abort(); controller.current = new AbortController()
        try {
            const data = await api<{ features: Record<string, number> }>(`/sample?traffic_type=${encodeURIComponent(trafficType)}`, { signal: controller.current.signal })
            if (mounted.current) setFeatures(Object.fromEntries(Object.entries(data.features).map(([name, value]) => [name, String(value)])))
        } catch (error) { if (mounted.current) setError(error instanceof Error ? error.message : 'Couldn’t load a sample. Check the API connection.') }
        finally { if (mounted.current) setBusy(null) }
    }
    async function analyze() {
        if (busy) return
        setError(''); setWarning(''); setPrediction(null)
        const bad = networkFeatures.filter(feature => !features[feature.name]?.trim() || !Number.isFinite(Number(features[feature.name])))
        setInvalid(bad.map(feature => feature.name))
        if (bad.length) {
            setError(filled === 0 ? 'Load a sample, or enter all 78 flow measurements.' : `Complete ${bad.length} missing or invalid field${bad.length === 1 ? '' : 's'}.`)
            if (filled > 0) { setExpanded(current => Array.from(new Set([...current, bad[0].group]))); requestAnimationFrame(() => document.getElementById(bad[0].name)?.focus()) }
            return
        }
        setBusy('predict'); controller.current?.abort(); controller.current = new AbortController()
        const endpoint = apiBase()
        try {
            const values = Object.fromEntries(networkFeatures.map(feature => [feature.name, Number(features[feature.name])]))
            const data = await api<Prediction>('/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ features: values }), signal: controller.current.signal })
            if (!mounted.current) return
            setPrediction(data)
            try { savePrediction(data, endpoint) } catch { setWarning('Analysis complete. Browser history could not be saved.') }
            requestAnimationFrame(() => {
                result.current?.focus({ preventScroll: true })
                if (window.matchMedia('(max-width: 760px)').matches) result.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
            })
        } catch (error) { if (mounted.current) setError(error instanceof Error ? error.message : 'Analysis failed. Try again.') }
        finally { if (mounted.current) setBusy(null) }
    }
    return <div className="page">
        <PageHeader eyebrow="Investigate" title="Analyze traffic" description="Load a sample or enter a flow’s measurements." />
        <div className="analysis-grid">
            <section className="panel panel-body">
                <div className="panel-heading"><div><h2>Flow input</h2><p>Start with a recorded sample</p></div><span className={`badge ${filled === networkFeatures.length ? 'badge-success' : ''}`}>{filled} / {networkFeatures.length} fields</span></div>
                <div className="sample-controls"><div><label className="field-label" htmlFor="traffic-type">Traffic category</label><select className="field" id="traffic-type" value={trafficType} disabled={!!busy} onChange={event => setTrafficType(event.target.value)}>{trafficTypes.map(type => <option key={type}>{type}</option>)}</select></div><button className="btn btn-secondary" disabled={!!busy} onClick={generate}>{busy === 'sample' ? <LoaderCircle size={15} className="spin" /> : <RefreshCw size={15} />}{busy === 'sample' ? 'Loading…' : 'Load sample'}</button></div>
                {error && <div style={{ marginTop: 16 }}><Notice>{error}</Notice></div>}
                <div className="feature-tools"><div className="search-field"><Search size={15} /><input className="field" aria-label="Search flow fields" placeholder="Search fields…" value={search} onChange={event => setSearch(event.target.value)} /></div><span className="small muted row"><SlidersHorizontal size={13} />Optional edits</span></div>
                <div>{visible.map(group => <details key={group.name} className="feature-group" open={!!search.trim() || expanded.includes(group.name)}>
                    <summary onClick={event => { event.preventDefault(); setExpanded(current => current.includes(group.name) ? current.filter(name => name !== group.name) : [...current, group.name]) }}>{group.name}<span className="feature-count">{group.fields.length} fields <span aria-hidden="true">⌄</span></span></summary>
                    {(!!search.trim() || expanded.includes(group.name)) && <div className="form-grid">{group.fields.map(feature => <div key={feature.name}><label className="field-label" htmlFor={feature.name}>{feature.label}</label><input className="field" id={feature.name} type="number" step="any" placeholder="0" value={features[feature.name] ?? ''} disabled={!!busy} aria-invalid={invalidSet.has(feature.name) || undefined} title={feature.description} onChange={event => change(feature.name, event.target.value)} /></div>)}</div>}
                </details>)}</div>
                {!visible.length && <p className="chart-note">No fields match “{search}”.</p>}
                <button className="btn btn-primary analysis-submit" onClick={analyze} disabled={!!busy}>{busy === 'predict' ? <><LoaderCircle className="spin" size={16} />Analyzing…</> : <>Analyze flow<ArrowRight size={16} /></>}</button>
                <WhyCard title="Why these measurements?">The model needs all 78 flow statistics in its training format. Samples fill them for you. You can inspect or edit each group before analyzing; a sample’s reference category does not guarantee the same prediction.</WhyCard>
            </section>
            <section ref={result} tabIndex={-1} aria-label="Prediction result" className="panel panel-body analysis-result" style={{ outline: 'none' }}>
                <div className="panel-heading"><div><h2>Prediction result</h2><p>{metadata?.model ?? 'Current model'}</p></div><ShieldCheck size={18} color="var(--accent)" /></div>
                {busy === 'predict' ? <div className="empty-state" role="status"><LoaderCircle className="spin" size={24} color="var(--accent)" /><h3>Analyzing your flow…</h3><p>This usually takes a moment.</p></div> : !prediction ? <EmptyState title="Ready when you are" text="Load a sample, then analyze the flow to see its category and risk." /> : <>
                    <p className="result-label">Predicted category</p><div className="row spread" style={{ alignItems: 'flex-start' }}><h3 className="result-category">{prediction.prediction}</h3><RiskBadge risk={prediction.risk_level} /></div>
                    <p className="result-confidence">{percent(prediction.confidence)}<span>model confidence</span></p>
                    <hr className="divider" /><div className="row spread"><h3>Class probabilities</h3><CheckCircle2 size={14} color="var(--accent)" /></div>
                    <div className="result-probabilities">{Object.entries(prediction.probabilities).sort(([, a], [, b]) => b - a).map(([name, value]) => <div key={name}><div className="probability-heading"><span>{name}</span><strong style={{ fontWeight: 500 }}>{percent(value)}</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${value * 100}%`, background: name === prediction.prediction ? 'var(--accent)' : '#537091' }} /></div></div>)}</div>
                    <details className="score-details"><summary>Global feature importance</summary><p className="chart-note">Overall model importance, not an explanation of this individual flow.</p><div className="result-probabilities">{prediction.feature_importances.map(item => <div className="probability-heading" key={item.feature}><span>{item.feature}</span><strong style={{ fontWeight: 500 }}>{percent(item.importance)}</strong></div>)}</div></details>
                    <p className="chart-note">Confidence is not a guarantee. Review suspicious results with other evidence.</p>
                </>}
                {warning && <div style={{ marginTop: 16 }}><Notice tone="info">{warning}</Notice></div>}
                <WhyCard title="What do confidence and risk mean?">Confidence shows the model’s preference for a class. Risk is the severity assigned to that category. Neither confirms an attack or proves a flow is safe.</WhyCard>
            </section>
        </div>
    </div>
}
