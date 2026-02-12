import { useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ProgressTracker from './ProgressTracker'
import AIAgentChat from '../ai/AIAgentChat'
import { usePreparationStore } from '../../store/preparationStore'
import tasksData from '../../data/tasks.json'
import type { Task } from '../../types'

export default function PreparationMode() {
  const navigate = useNavigate()
  const location = useLocation()
  const { seedFromTasks, allInitiatives } = usePreparationStore()

  useEffect(() => {
    if (allInitiatives.length === 0) {
      seedFromTasks(tasksData as Task[])
    }
  }, [allInitiatives.length, seedFromTasks])

  const path = location.pathname
  if (path === '/preparation' || path === '/preparation/') {
    navigate('/preparation/step/1', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b sticky top-0 z-30 backdrop-blur-sm bg-white/95">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
              <img src="/logo/dixy.svg" alt="Дикси" className="h-8 w-auto" />
              <img src="/logo/glowbyte.svg" alt="Глоубайт" className="h-8 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center hidden sm:block flex-shrink-0">
              Подготовка к защите
            </h1>
            <div className="flex items-center justify-end gap-2 flex-1 sm:flex-initial min-w-0">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">На главную</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        <ProgressTracker />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
          <Outlet />
        </div>
      </div>

      <AIAgentChat />
    </div>
  )
}
