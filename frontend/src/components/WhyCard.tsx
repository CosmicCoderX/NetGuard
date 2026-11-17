import { Lightbulb } from 'lucide-react'
import type { ReactNode } from 'react'

export default function WhyCard({ children, title = 'Why this matters' }: { children: ReactNode; title?: string }) {
    return <details className="help-disclosure"><summary><Lightbulb aria-hidden="true" size={14} />{title}<span className="disclosure-plus" aria-hidden="true">+</span></summary><div>{children}</div></details>
}
