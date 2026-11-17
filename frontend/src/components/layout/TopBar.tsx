import { useEffect, useState, type RefObject } from 'react'
import { Menu, ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../../lib/api'

const titles: Record<string, string> = { '/overview': 'Overview', '/analyze': 'Analyze traffic', '/model-lab': 'Model lab', '/dataset': 'Dataset', '/history': 'History', '/settings': 'Settings' }
export default function TopBar({ open, onMenu, menuRef }: { open: boolean; onMenu: () => void; menuRef: RefObject<HTMLButtonElement | null> }) {
    const { pathname } = useLocation()
    const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')
    useEffect(() => { document.title = `${titles[pathname] ?? 'Workspace'} · NetGuard` }, [pathname])
    useEffect(() => {
        let active = true
        let controller: AbortController | null = null
        let generation = 0
        async function check() {
            const current = ++generation
            controller?.abort()
            controller = new AbortController()
            try {
                const health = await api<{ status: string; model_loaded: boolean }>('/health', { signal: controller.signal })
                if (active && current === generation) setStatus(health.status === 'healthy' && health.model_loaded ? 'online' : 'offline')
            } catch { if (active && current === generation) setStatus('offline') }
        }
        void check()
        const visibleCheck = () => { if (document.visibilityState === 'visible') void check() }
        const settingsCheck = () => { setStatus('checking'); void check() }
        const timer = window.setInterval(visibleCheck, 30000)
        document.addEventListener('visibilitychange', visibleCheck)
        window.addEventListener('netguard-settings', settingsCheck)
        return () => { active = false; controller?.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', visibleCheck); window.removeEventListener('netguard-settings', settingsCheck) }
    }, [])
    return <header className="topbar"><div className="topbar-left"><button ref={menuRef} className="icon-button mobile-toggle" aria-label="Open navigation" aria-controls="primary-navigation" aria-expanded={open} onClick={onMenu}><Menu size={18} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={12} aria-hidden="true" /><strong>{titles[pathname] ?? 'NetGuard'}</strong></div></div><div className="row"><span className="workspace-tag">ML workspace</span><span className="connection-divider" /><Link to="/settings" className={`connection ${status}`} role="status" title={status === 'offline' ? 'Check the API endpoint in Settings' : 'Prediction service connection'}><span className="status-dot" />{status === 'online' ? 'API online' : status === 'offline' ? 'API offline' : 'Connecting…'}</Link></div></header>
}
