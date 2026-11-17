import { useMetadata } from '../../lib/api'
import { DataState } from '../ui'
import WhyCard from '../WhyCard'

const colors = ['#6da8ff', '#50dbc6', '#ac9bf5', '#e9c37a', '#ec9eaa', '#819fc1']
const number = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
export default function TrafficDistribution() {
    const { data, error } = useMetadata()
    const counts = data?.evaluation?.class_counts
    if (!data) return <DataState error={error} />
    if (!counts) return <p className="chart-note">Dataset counts are unavailable.</p>
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
    return <div><div className="distribution-rows">{Object.entries(counts).map(([label, count], index) => <div key={label} title={`${label}: ${count.toLocaleString()} flows (${(count / total * 100).toFixed(2)}%)`}><div className="distribution-label"><span>{label}</span><strong>{number.format(count)} <span style={{ color: '#5d7291', marginLeft: 6 }}>{(count / total * 100).toFixed(1)}%</span></strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${count / total * 100}%`, background: colors[index % colors.length] }} /></div></div>)}</div><WhyCard title="Why class balance matters">Normal traffic dominates this dataset. Rare attacks can be harder to detect, even when overall accuracy is high. These are recorded dataset counts, not live traffic.</WhyCard></div>
}
