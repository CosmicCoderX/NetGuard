import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Sidebar from "./components/layout/Sidebar"
import TopBar from "./components/layout/TopBar"

import Overview from "./pages/Overview"
import AnalyzeTraffic from "./pages/AnalyzeTraffic"
import ModelLab from "./pages/ModelLab"
import Dataset from "./pages/Dataset"
import History from "./pages/History"
import Settings from "./pages/Settings"


function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950 text-slate-200">

        {/* Sidebar */}
        <Sidebar />

        {/* Main application */}
        <div className="flex min-w-0 flex-1 flex-col">

          <TopBar />

          <main className="flex-1 overflow-auto p-6 lg:p-8">
            <Routes>

              <Route
                path="/"
                element={<Navigate to="/overview" replace />}
              />

              <Route
                path="/overview"
                element={<Overview />}
              />

              <Route
                path="/analyze"
                element={<AnalyzeTraffic />}
              />

              <Route
                path="/model-lab"
                element={<ModelLab />}
              />

              <Route
                path="/dataset"
                element={<Dataset />}
              />

              <Route
                path="/history"
                element={<History />}
              />

              <Route
                path="/settings"
                element={<Settings />}
              />

            </Routes>
          </main>

        </div>

      </div>
    </BrowserRouter>
  )
}

export default App