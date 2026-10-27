import { Bell, Moon } from "lucide-react"

function TopBar() {
    return (
        <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950 px-8">
            <div>
                <p className="text-sm text-slate-500">
                    Network Security
                </p>

                <h2 className="text-lg font-semibold text-white">
                    NetGuard Dashboard
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    <span className="text-xs font-medium text-slate-300">
                        API Online
                    </span>
                </div>

                <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white">
                    <Bell className="h-4 w-4" />
                </button>

                <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white">
                    <Moon className="h-4 w-4" />
                </button>
            </div>
        </header>
    )
}

export default TopBar