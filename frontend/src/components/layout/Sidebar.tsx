import { BarChart3, Database, History, LayoutDashboard, ScanSearch, Settings, Shield, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const navigation = [
    { name: 'Overview', path: '/overview', icon: LayoutDashboard },
    { name: 'Analyze traffic', path: '/analyze', icon: ScanSearch },
    { name: 'Model lab', path: '/model-lab', icon: BarChart3 },
    { name: 'Dataset', path: '/dataset', icon: Database },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
    const sidebar = useRef<HTMLElement>(null)
    useEffect(() => {
        if (!open) return
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        sidebar.current?.querySelector<HTMLButtonElement>('button')?.focus()
        function keyboard(event: KeyboardEvent) {
            if (event.key === 'Escape') { event.preventDefault(); onClose() }
            if (event.key !== 'Tab') return
            const items = Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a, button') ?? []).filter(item => item.offsetParent !== null)
            const first = items[0], last = items[items.length - 1]
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
        }
        function resize() { if (window.matchMedia('(min-width: 1024px)').matches) onClose() }
        document.addEventListener('keydown', keyboard)
        window.addEventListener('resize', resize)
        return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keyboard); window.removeEventListener('resize', resize) }
    }, [open, onClose])
    return <>
        {open && <button className="sidebar-overlay is-open" aria-label="Close navigation overlay" tabIndex={-1} onClick={onClose} />}
        <aside ref={sidebar} id="primary-navigation" className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Primary navigation">
            <NavLink className="brand" to="/overview" onClick={onClose}><span className="brand-icon"><Shield size={20} /></span><div><p className="brand-name">NetGuard</p><p className="brand-subtitle">Network intelligence</p></div></NavLink>
            <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={onClose}><X size={17} /></button>
            <p className="nav-label">Workspace</p>
            <nav aria-label="Workspace">{navigation.slice(0, 5).map(({ name, path, icon: Icon }) => <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon aria-hidden="true" />{name}</NavLink>)}</nav>
            <div className="nav-bottom"><NavLink to="/settings" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Settings aria-hidden="true" />Settings</NavLink><div className="workspace-note">CIC-IDS2017 dataset<br />Local analysis workspace</div></div>
        </aside>
    </>
}
