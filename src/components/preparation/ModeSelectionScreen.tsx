import { useNavigate } from 'react-router-dom'
import { Heart, FileCheck, BarChart3, ListTodo } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import TasksPanel from '../tasks/TasksPanel'

export default function ModeSelectionScreen() {
  const navigate = useNavigate()
  const { isTasksPanelOpen, toggleTasksPanel } = useAppStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-30 backdrop-blur-sm bg-white/95">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
              <img src="/logo/dixy.svg" alt="Дикси" className="h-8 w-auto" />
              <img src="/logo/glowbyte.svg" alt="Глоубайт" className="h-8 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center hidden sm:block flex-shrink-0">
              Category Review
            </h1>
            <div className="flex items-center justify-end gap-2 flex-1 sm:flex-initial min-w-0">
              <button
                onClick={() => navigate('/schedule')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">График пересмотра</span>
              </button>
              <button
                onClick={toggleTasksPanel}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                <ListTodo className="w-5 h-5" />
                <span className="hidden sm:inline">Задачи менеджера</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
            Выберите режим работы
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Здоровье категории — для ежедневного мониторинга. Подготовка к защите — для
            структурированной подготовки к пересмотру.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/matrix')}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Здоровье категории</h3>
              <p className="text-sm text-gray-600 text-center">
                Свободная навигация по матрице отчётов. Анализ в любом порядке.
              </p>
            </button>

            <button
              onClick={() => navigate('/preparation/step/1')}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <FileCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Подготовка к защите</h3>
              <p className="text-sm text-gray-600 text-center">
                Пошаговый процесс анализа с накоплением инициатив и приоритизацией.
              </p>
            </button>
          </div>
        </div>
      </main>

      {isTasksPanelOpen && <TasksPanel onClose={toggleTasksPanel} />}
    </div>
  )
}
