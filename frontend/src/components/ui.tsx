import { AlertCircle, ArrowRight, Inbox, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { refreshMetadata } from '../lib/api'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
    return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action && <div className="page-actions">{action}</div>}</div>
}
export function RiskBadge({ risk }: { risk: string }) {
    return <span className={`badge ${risk === 'Low' ? 'badge-success' : risk === 'High' ? 'badge-warning' : 'badge-danger'}`}><span className="status-dot" />{risk}</span>
}
export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
    return <div className="empty-state"><span className="empty-icon"><Inbox size={22} /></span><h3>{title}</h3><p>{text}</p>{action}</div>
}
export function Notice({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'success' | 'info' }) {
    return <div className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}><AlertCircle size={17} /><span>{children}</span></div>
}
export function DataState({ error }: { error?: string }) {
    return error ? <div className="data-state"><Notice>Couldn’t load model data. Check your API connection in Settings.</Notice><button className="btn btn-secondary btn-small" onClick={refreshMetadata}><RefreshCw size={14} />Retry</button></div>
        : <div className="skeleton-grid" aria-label="Loading model data" role="status"><span className="sr-only">Loading model data…</span><div /><div /><div /></div>
}
export function AnalyzeLink() { return <Link className="btn btn-primary" to="/analyze">Analyze traffic<ArrowRight size={16} /></Link> }
