import { CheckCircle2, Cpu, Layers, Target } from 'lucide-react'
import { percent, useMetadata } from '../lib/api'
import { DataState, PageHeader } from '../components/ui'
import WhyCard from '../components/WhyCard'
import ModelPerformance from '../components/charts/ModelPerformance'

export default function ModelLab() {
    const { data, error } = useMetadata()
    const report = data?.evaluation
    return <div className="page">
        <PageHeader eyebrow="Evaluate" title="Model lab" description="Compare the evidence behind each prediction." action={data ? <span className="badge badge-success"><CheckCircle2 size={12} />{data.model}</span> : undefined} />
        {!data ? <DataState error={error} /> : !report ? <p className="notice notice-info">No evaluation matches the current model artifacts.</p> : <>
            <section className="metrics-grid" aria-label="Evaluation summary">{[
                { label: 'Accuracy', value: percent(report.accuracy), caption: 'Overall correct predictions', icon: Target },
                { label: 'Macro precision', value: percent(report.macro_precision ?? report.classification_report['macro avg'].precision), caption: 'Equal weight per class', icon: CheckCircle2 },
                { label: 'Macro F1', value: percent(report.macro_f1), caption: 'Precision + recall balance', icon: Layers },
                { label: 'Test flows', value: report.test_rows.toLocaleString(), caption: 'Shared test partition', icon: Cpu },
            ].map(({ label, value, caption, icon: Icon }) => <div className="panel metric" key={label}><div className="metric-top"><span>{label}</span><Icon size={15} className="metric-icon" /></div><p className="metric-value">{value}</p><p className="metric-caption">{caption}</p></div>)}</section>
            <section className="panel panel-body"><div className="panel-heading"><div><h2>Model comparison</h2><p>Same test data. Selection based on validation scores.</p></div><span className="badge">3 candidates</span></div><ModelPerformance detailed /></section>
            <section className="panel panel-body"><div className="panel-heading"><div><h2>Performance by class</h2><p>Find the categories that need a closer look.</p></div><span className="badge">6 classes</span></div><div className="table-wrap"><table className="data-table"><thead><tr>{['Class', 'Precision', 'Recall', 'F1', 'Test flows'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{report.classes.map(label => { const metrics = report.classification_report[label]; return <tr key={label}><td>{label}</td><td style={{ color: metrics.precision < .9 ? '#e9c37a' : undefined }}>{percent(metrics.precision)}</td><td>{percent(metrics.recall)}</td><td>{percent(metrics['f1-score'])}</td><td className="cell-muted">{metrics.support.toLocaleString()}</td></tr> })}</tbody></table></div><WhyCard title="Why check individual classes?">Overall accuracy can hide weaker results for rare attacks. Precision measures label reliability; recall measures how many actual cases are detected.</WhyCard></section>
            <section className="panel panel-body"><details className="evaluation-disclosure"><summary className="row spread"><div><h2>Confusion matrix</h2><p className="section-subtitle">See which categories are mistaken for one another.</p></div><span className="muted" aria-hidden="true">＋</span></summary><p className="chart-note">Rows: actual class · Columns: predicted class</p><div className="table-wrap" style={{ marginTop: 16 }}><table className="data-table matrix-table"><thead><tr><th>Actual / predicted</th>{report.classes.map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{report.confusion_matrix.map((row, i) => <tr key={report.classes[i]}><td>{report.classes[i]}</td>{row.map((count, j) => <td key={j} style={{ background: i === j ? '#50dbc60b' : count ? '#ed95950c' : undefined, color: i === j ? '#83d8c6' : count ? '#e6a2a2' : '#536b88' }}>{count.toLocaleString()}</td>)}</tr>)}</tbody></table></div></details></section>
            <section className="panel panel-body"><details className="evaluation-disclosure"><summary className="row spread"><div><h2>Evaluation notes</h2><p className="section-subtitle">Method, limitations & last evaluation</p></div><span className="muted" aria-hidden="true">＋</span></summary><div className="stack" style={{ marginTop: 18 }}><p className="chart-note">{report.split}</p><p className="chart-note">{report.selection_rule}</p><ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>{report.limitations.map(text => <li key={text}>{text}</li>)}</ul><p className="small muted">Evaluated {new Date(report.evaluated_at).toLocaleString()}</p></div></details></section>
        </>}
    </div>
}
