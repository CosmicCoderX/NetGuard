import {
    BarChart3,
    Database,
    History,
    LayoutDashboard,
    ScanSearch,
    Settings,
    Shield,
} from "lucide-react"

import { NavLink } from "react-router-dom"


const navigation = [
    {
        name: "Overview",
        path: "/overview",
        icon: LayoutDashboard,
    },
    {
        name: "Analyze Traffic",
        path: "/analyze",
        icon: ScanSearch,
    },
    {
        name: "Model Lab",
        path: "/model-lab",
        icon: BarChart3,
    },
    {
        name: "Dataset",
        path: "/dataset",
        icon: Database,
    },
    {
        name: "History",
        path: "/history",
        icon: History,
    },
    {
        name: "Settings",
        path: "/settings",
        icon: Settings,
    },
]


function Sidebar() {
    return (
        <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950">

            {/* Logo */}
            <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                    <Shield className="h-5 w-5 text-sky-400" />
                </div>

                <div>
                    <h1 className="text-lg font-semibold text-white">
                        NetGuard
                    </h1>

                    <p className="text-xs text-slate-500">
                        ML Security Platform
                    </p>
                </div>

            </div>


            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-5">

                {navigation.map((item) => {

                    const Icon = item.icon

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                }`
                            }
                        >
                            <Icon className="h-4 w-4" />

                            {item.name}
                        </NavLink>
                    )

                })}

            </nav>


            {/* Footer */}
            <div className="border-t border-slate-800 p-4">

                <div className="flex items-center gap-2 text-xs text-slate-500">

                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    System operational

                </div>

            </div>

        </aside>
    )
}


export default Sidebar