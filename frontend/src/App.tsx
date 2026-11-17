import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import { DataState } from './components/ui'

const Overview = lazy(() => import('./pages/Overview'))
const AnalyzeTraffic = lazy(() => import('./pages/AnalyzeTraffic'))
const ModelLab = lazy(() => import('./pages/ModelLab'))
const Dataset = lazy(() => import('./pages/Dataset'))
const History = lazy(() => import('./pages/History'))
const Settings = lazy(() => import('./pages/Settings'))

function Workspace() {
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLButtonElement>(null)
    const { pathname } = useLocation()
    const close = useCallback(() => { setOpen(false); requestAnimationFrame(() => menuRef.current?.focus()) }, [])
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
    return <div className="app-shell">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Sidebar open={open} onClose={close} />
        <div className="app-content" inert={open || undefined}>
            <TopBar open={open} onMenu={() => setOpen(true)} menuRef={menuRef} />
            <main id="main-content" className="main-content" tabIndex={-1}>
                <Suspense fallback={<DataState />}><Routes>
                    <Route path="/" element={<Navigate to="/overview" replace />} />
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/analyze" element={<AnalyzeTraffic />} />
                    <Route path="/model-lab" element={<ModelLab />} />
                    <Route path="/dataset" element={<Dataset />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<div className="empty-state"><h1>Page not found</h1><Link className="btn btn-primary" to="/overview">Back to overview</Link></div>} />
                </Routes></Suspense>
            </main>
        </div>
    </div>
}
export default function App() { return <BrowserRouter><Workspace /></BrowserRouter> }
