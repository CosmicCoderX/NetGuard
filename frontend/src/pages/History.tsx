import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { clearHistory, readHistory } from '../lib/history'
import { percent } from '../lib/api'
import { EmptyState, Notice, PageHeader, RiskBadge } from '../components/ui'
import WhyCard from '../components/WhyCard'

const pageSize = 20
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
export default function History() {
    const [entries, setEntries] = useState(readHistory)
    const [filter, setFilter] = useState('')
    const [risk, setRisk] = useState('')
    const [page, setPage] = useState(0)
    const [confirming, setConfirming] = useState(false)
    const [error, setError] = useState('')
    const indexed = useMemo(() => entries.map(entry => {
        const time = dateFormat.format(new Date(entry.timestamp))
        return { ...entry, time, search: `${entry.prediction} ${entry.timestamp} ${time}`.toLowerCase() }
    }), [entries])
    const rows = useMemo(() => indexed.filter(entry => (!risk || entry.risk_level === risk) && entry.search.includes(filter.trim().toLowerCase())), [indexed, risk, filter])
    const currentPage = Math.min(page, Math.max(0, Math.ceil(rows.length / pageSize) - 1))
    const visible = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    function download() {
        const quote = (value: string) => `"${value.replaceAll('"', '""')}"`
        const csv = [['Timestamp', 'Prediction', 'Confidence', 'Risk', 'API endpoint'], ...rows.map(entry => [entry.timestamp, entry.prediction, String(entry.confidence), entry.risk_level, entry.endpoint])].map(row => row.map(quote).join(',')).join('\r\n')
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
        const link = document.createElement('a'); link.href = url; link.download = 'netguard-history.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    function remove() {
        try { clearHistory(); setEntries([]); setConfirming(false); setPage(0); setError('') }
        catch { setError('Browser storage is unavailable. History was not cleared.') }
    }
    return <div className="page">
        <PageHeader eyebrow="Activity" title="Prediction history" description="Your last 500 analyses, saved in this browser." action={<button className="btn btn-secondary" onClick={download} disabled={!rows.length}><Download size={15} />Export CSV</button>} />
        <section className="panel panel-body">
            <div className="toolbar"><div className="search-field"><Search size={15} /><input className="field" aria-label="Search predictions or dates" placeholder="Search predictions or dates…" value={filter} onChange={event => { setFilter(event.target.value); setPage(0) }} /></div><select className="field" aria-label="Filter risk" value={risk} onChange={event => { setRisk(event.target.value); setPage(0) }}><option value="">All risks</option>{['Low', 'High', 'Critical'].map(value => <option key={value}>{value}</option>)}</select><button className="btn btn-ghost" onClick={() => setConfirming(true)} disabled={!entries.length}><Trash2 size={14} />Clear</button></div>
            {confirming && <div className="confirm-row"><span>Clear all local history? This can’t be undone.</span><button className="btn btn-danger btn-small" onClick={remove}>Clear history</button><button className="btn btn-ghost btn-small" onClick={() => setConfirming(false)}>Cancel</button></div>}
            {error && <Notice>{error}</Notice>}
            {visible.length ? <><div className="table-wrap"><table className="data-table"><thead><tr><th>Prediction</th><th>Confidence</th><th>Risk</th><th>Analyzed</th></tr></thead><tbody>{visible.map(entry => <tr key={entry.id}><td>{entry.prediction}</td><td>{percent(entry.confidence)}</td><td><RiskBadge risk={entry.risk_level} /></td><td className="cell-muted">{entry.time}</td></tr>)}</tbody></table></div><div className="pagination"><span>{currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, rows.length)} of {rows.length} results</span><div className="row" style={{ gap: 6 }}><button className="icon-button" aria-label="Previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={15} /></button><button className="icon-button" aria-label="Next page" disabled={(currentPage + 1) * pageSize >= rows.length} onClick={() => setPage(currentPage + 1)}><ChevronRight size={15} /></button></div></div></> : <EmptyState title={entries.length ? 'No matching analyses' : 'No analyses yet'} text={entries.length ? 'Try a different search or risk filter.' : 'Analyze a sample flow to create your first result.'} action={entries.length ? <button className="btn btn-secondary btn-small" onClick={() => { setFilter(''); setRisk('') }}>Reset filters</button> : <Link className="btn btn-primary btn-small" to="/analyze">Analyze traffic</Link>} />}
            <WhyCard title="Why keep a history?">Review past outcomes or export filtered results for follow-up. Entries are local to this browser and are not a shared server audit trail.</WhyCard>
        </section>
    </div>
}
