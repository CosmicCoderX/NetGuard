import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Database, LoaderCircle, Search } from 'lucide-react'
import { api, useMetadata } from '../lib/api'
import { DataState, EmptyState, Notice, PageHeader } from '../components/ui'
import WhyCard from '../components/WhyCard'

export default function Dataset() {
    const { data, error } = useMetadata()
    const [sample, setSample] = useState<{ traffic_type: string; features: Record<string, number> } | null>(null)
    const [sampleError, setSampleError] = useState('')
    const [busy, setBusy] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const controller = useRef<AbortController | null>(null)
    const mounted = useRef(true)
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort() } }, [])
    const fields = useMemo(() => Object.entries(sample?.features ?? {}).filter(([name]) => name.toLowerCase().includes(search.trim().toLowerCase())), [sample, search])
    async function inspect(label: string) {
        if (busy) return
        setBusy(label); setSampleError(''); setSample(null); setSearch('')
        controller.current?.abort(); controller.current = new AbortController()
        try {
            const value = await api<{ traffic_type: string; features: Record<string, number> }>(`/sample?traffic_type=${encodeURIComponent(label)}`, { signal: controller.current.signal })
            if (mounted.current) setSample(value)
        } catch (error) { if (mounted.current) setSampleError(error instanceof Error ? error.message : 'Couldn’t load sample.') }
        finally { if (mounted.current) setBusy(null) }
    }
    return <div className="page">
        <PageHeader eyebrow="Explore" title="Dataset" description="Six traffic categories. Real recorded examples." action={<span className="badge badge-blue"><Database size={12} />CIC-IDS2017</span>} />
        {!data ? <DataState error={error} /> : <div className="dataset-grid">{data.classes.map(label => <button key={label} className={`panel dataset-card ${sample?.traffic_type === label ? 'selected' : ''}`} disabled={!!busy} onClick={() => inspect(label)} aria-label={`Load ${label} sample`}><h3>{label}</h3><p className="count">{data.evaluation?.class_counts[label]?.toLocaleString() ?? '—'}</p><p className="sample-note">evaluation dataset flows</p><div className="dataset-card-footer"><span>{data.sample_counts[label] ?? 0} samples</span><span className="row" style={{ gap: 5 }}>{busy === label ? <LoaderCircle size={13} className="spin" /> : <ArrowRight size={14} />}<span>{busy === label ? 'Loading' : 'Inspect'}</span></span></div></button>)}</div>}
        {sampleError && <Notice>{sampleError}</Notice>}
        {sample && <section className="panel panel-body"><div className="panel-heading"><div><h2>{sample.traffic_type} sample</h2><p>{Object.keys(sample.features).length} recorded flow measurements</p></div><span className="badge badge-success">Sample loaded</span></div><div className="toolbar"><div className="search-field"><Search size={15} /><input className="field" aria-label="Search sample features" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search features…" /></div></div><div className="table-wrap" style={{ maxHeight: 420 }}><table className="data-table"><thead><tr><th>Feature</th><th>Value</th></tr></thead><tbody>{fields.map(([name, value]) => <tr key={name}><td>{name}</td><td title={String(value)}>{value !== 0 && Math.abs(value) < .001 ? value.toExponential(3) : value.toLocaleString(undefined, { maximumFractionDigits: 5 })}</td></tr>)}</tbody></table></div>{!fields.length && <EmptyState title="No matching features" text="Try a different feature name." />}</section>}
        <WhyCard title="About this dataset">Examples show what the model learns from. Counts come from the evaluation dataset; samples are curated examples, not a complete raw-data browser. Reference labels and model predictions can differ.</WhyCard>
    </div>
}
