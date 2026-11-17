import { Activity, ArrowRight, Eye, Radar, ShieldCheck } from 'lucide-react'

export default function WhyNetGuard() {
    return <section className="panel hero" aria-labelledby="why-netguard"><div><p className="eyebrow">Why NetGuard?</p><h2 id="why-netguard">Less noise. Clearer signals.</h2><p>Turn network measurements into a clear starting point for investigating suspicious traffic.</p><div className="hero-steps"><span><Activity size={13} />Understand</span><ArrowRight size={11} aria-hidden="true" /><span><Radar size={13} />Detect patterns</span><ArrowRight size={11} aria-hidden="true" /><span><Eye size={13} />Review</span></div></div><div className="hero-visual" aria-hidden="true"><span className="hero-shield"><ShieldCheck size={34} strokeWidth={1.3} /></span><span className="hero-marker" /></div></section>
}
