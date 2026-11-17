import { ArrowUpRight, Check } from 'lucide-react'
import { percent, useMetadata, type Evaluation } from '../../lib/api'
import { DataState } from '../ui'
import WhyCard from '../WhyCard'

const series = [
    { key: 'accuracy' as const, label: 'Accuracy', color: '#6da8ff' },
    { key: 'macro_precision' as const, label: 'Precision', color: '#ac9bf5' },
    { key: 'macro_f1' as const, label: 'F1 score', color: '#50dbc6' },
]
export default function ModelPerformance({ detailed = false }: { detailed?: boolean }) {
    const { data, error } = useMetadata()
    const report = data?.evaluation
    const models = report?.comparison
    if (!data) return <DataState error={error} />
    if (!models?.length || !report) return <p className="chart-note">No comparison report is available.</p>
    const selected = models.find(model => model.selected)
    const baseline = models.find(model => model.name === 'XGBoost baseline')
    const gain = selected && baseline ? (selected.test.macro_precision - baseline.test.macro_precision) * 100 : null
    const left = 38, top = 12, chartHeight = 140, chartWidth = 600, groupWidth = chartWidth / models.length
    return <div>
        <div className="chart-legend">{series.map(item => <span key={item.key}><i className="legend-dot" style={{ background: item.color }} />{item.label}</span>)}</div>
        <svg className="comparison-svg" viewBox="0 0 660 195" role="img" aria-labelledby="comparison-title comparison-desc">
            <title id="comparison-title">Model comparison</title><desc id="comparison-desc">Accuracy, macro precision and macro F1 on the same {report.test_rows.toLocaleString()} test flows. Scores range from zero to one hundred percent. Exact values are available in detailed scores.</desc>
            {[0, 25, 50, 75, 100].map(tick => { const y = top + chartHeight * (1 - tick / 100); return <g key={tick}><line x1={left} y1={y} x2={left + chartWidth} y2={y} stroke="#9bb0d0" strokeOpacity=".1" strokeDasharray="3 5" /><text x={left - 9} y={y + 3} textAnchor="end" fill="#7185a2" fontSize="10">{tick}%</text></g> })}
            {models.map((model, index) => { const center = left + groupWidth * (index + .5); const width = Math.min(32, groupWidth / 5); return <g key={model.name}>
                {series.map((metric, j) => { const value = model.test[metric.key]; const height = value * chartHeight; return <rect key={metric.key} x={center + (j - 1) * (width + 6) - width / 2} y={top + chartHeight - height} width={width} height={height} rx="3" fill={metric.color}><title>{model.name} — {metric.label}: {percent(value, 4)}</title></rect> })}
                <text x={center} y={176} textAnchor="middle" fill={model.selected ? '#8ce7d4' : '#a1b2ca'} fontSize="12">{model.name.replace('XGBoost ', 'XGB ')}{model.selected ? ' ✓' : ''}</text>
            </g> })}
        </svg>
        <div className="mobile-comparison" role="group" aria-label="Model comparison">
            {models.map(model => <div key={model.name}><div className="mobile-model-name">{model.name}{model.selected && <Check size={12} color="var(--accent)" />}</div><div className="mobile-metrics">{series.map(metric => <div key={metric.key}><div className="bar-track"><div className="bar-fill" style={{ width: `${model.test[metric.key] * 100}%`, background: metric.color }} /></div><span className="sr-only">{metric.label}: </span><strong>{percent(model.test[metric.key])}</strong></div>)}</div></div>)}
        </div>
        <div className="comparison-summary"><span className="badge badge-success"><Check size={11} />{selected?.name ?? 'No model selected'}</span>{gain !== null && <span className="row" style={{ gap: 3 }}><ArrowUpRight size={12} color="var(--accent)" />{gain >= 0 ? '+' : ''}{gain.toFixed(2)} pp precision vs. baseline</span>}</div>
        {detailed ? <div className="table-wrap" style={{ marginTop: 20 }}><ScoreTable models={models} /></div> : <details className="score-details"><summary>Detailed scores</summary><div className="table-wrap" style={{ marginTop: 12 }}><ScoreTable models={models} /></div></details>}
        <WhyCard title="How to read this comparison">Accuracy is overall correctness. Precision is how often a label is correct; F1 balances precision and recall. Precision and F1 give each class equal weight. All models use the same test flows; selection uses validation scores. Inference times exclude preprocessing and network time.</WhyCard>
    </div>
}
function ScoreTable({ models }: { models: NonNullable<Evaluation['comparison']> }) {
    return <table className="data-table compact"><caption className="sr-only">Measured model comparison on a shared test partition</caption><thead><tr>{['Model', 'Accuracy', 'Precision', 'F1', 'Latency'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{models?.map(model => <tr className={model.selected ? 'selected' : ''} key={model.name}><td><span className="model-name">{model.name}{model.selected && <Check size={12} color="var(--accent)" />}</span></td><td>{percent(model.test.accuracy, 4)}</td><td>{percent(model.test.macro_precision)}</td><td>{percent(model.test.macro_f1)}</td><td>{model.single_flow_ms.toFixed(2)} ms</td></tr>)}</tbody></table>
}
