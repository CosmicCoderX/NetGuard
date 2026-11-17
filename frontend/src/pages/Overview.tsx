import { Link } from 'react-router-dom'
import { ArrowRight, Cpu, Database, Layers, Target } from 'lucide-react'
import { useMemo } from 'react'
import { percent, useMetadata } from '../lib/api'
import { readHistory } from '../lib/history'
import { AnalyzeLink, DataState, EmptyState, PageHeader, RiskBadge } from '../components/ui'
import WhyNetGuard from '../components/WhyNetGuard'
import WhyCard from '../components/WhyCard'
import ModelPerformance from '../components/charts/ModelPerformance'
import TrafficDistribution from '../components/charts/TrafficDistribution'

export default function Overview() {
    const { data, error } = useMetadata()
    const entries = useMemo(() => readHistory().slice(0, 4), [])
    const report = data?.evaluation
    const stats = [
        { label: 'Test accuracy', value: report ? percent(report.accuracy) : '—', caption: 'On held-out test flows', icon: Target },
        { label: 'Macro precision', value: report ? percent(report.macro_precision ?? report.classification_report['macro avg'].precision) : '—', caption: 'Equal weight for every class', icon: Layers },
        { label: 'Dataset flows', value: report ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(report.dataset_rows) : '—', caption: `${data?.classes.length ?? '6'} traffic categories`, icon: Database },
        { label: 'Active model', value: data?.model.replace('XGBoost ', 'XGB ') ?? '—', caption: 'Selected on validation data', icon: Cpu },
    ]
    return <div className="page">
        <PageHeader eyebrow="Your workspace" title="Security at a glance" description="A clear view of your model and recent analyses." action={<AnalyzeLink />} />
        <WhyNetGuard />
        {error && <DataState error={error} />}
        <section className="metrics-grid" aria-label="Key model metrics">{stats.map(({ label, value, caption, icon: Icon }) => <article className="panel metric" key={label}><div className="metric-top"><span>{label}</span><Icon className="metric-icon" size={16} /></div><p className={`metric-value ${label === 'Active model' ? 'metric-value-small' : ''}`}>{value}</p><p className="metric-caption">{caption}</p></article>)}</section>
        <div className="section-grid">
            <section className="panel panel-body"><div className="panel-heading"><div><h2>Model comparison</h2><p>Accuracy, precision & balanced performance</p></div><Link className="text-link" to="/model-lab">Model lab<ArrowRight size={13} /></Link></div><ModelPerformance /></section>
            <section className="panel panel-body"><div className="panel-heading"><div><h2>Traffic in the dataset</h2><p>Recorded flows by category</p></div><span className="badge">6 classes</span></div><TrafficDistribution /></section>
        </div>
        <section className="panel"><div className="panel-body" style={{ paddingBottom: entries.length ? 10 : 0 }}><div className="panel-heading" style={{ marginBottom: 10 }}><div><h2>Recent analyses</h2><p>Saved in this browser</p></div><Link className="text-link" to="/history">View all<ArrowRight size={13} /></Link></div></div>{entries.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Prediction</th><th>Confidence</th><th>Risk</th><th>Analyzed</th></tr></thead><tbody>{entries.map(entry => <tr key={entry.id}><td>{entry.prediction}</td><td>{percent(entry.confidence)}</td><td><RiskBadge risk={entry.risk_level} /></td><td className="cell-muted">{new Date(entry.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td></tr>)}</tbody></table></div> : <EmptyState title="Your first analysis starts here" text="Load a sample flow to explore the model." action={<Link className="text-link" to="/analyze">Analyze a flow<ArrowRight size={13} /></Link>} />}
            <div className="panel-footer"><WhyCard title="Why keep recent results?">Revisit outcomes and decide what needs follow-up. This browser keeps up to 500 analyses; it is not a shared audit log.</WhyCard></div>
        </section>
        <p className="small muted">Research tool · Supplied flow data only · Predictions need human review.</p>
    </div>
}
