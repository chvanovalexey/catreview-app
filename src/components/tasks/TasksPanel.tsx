import { useState } from 'react'
import { X, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '../../hooks/useTasks'
import { formatShortDate, getStatusColor } from '../../utils/formatters'
import { reportNames } from '../../utils/reportMapper'

interface TasksPanelProps {
  onClose: () => void
}

export default function TasksPanel({ onClose }: TasksPanelProps) {
  const [filter, setFilter] = useState<string>('Все')
  const { tasks, stats } = useTasks(filter)
  const navigate = useNavigate()
  
  const statuses = ['Все', 'Новая', 'В работе', 'Выполнена', 'Просрочена']
  
  const handleTaskClick = (reportId: string) => {
    // Сохраняем информацию о том, что отчёт открыт из TasksPanel
    navigate(`/report/${reportId}`, {
      state: { 
        source: 'tasks'
      }
    })
    onClose()
  }
  
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white">
        <h2 className="text-lg font-semibold">Задачи менеджера</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4 border-b bg-gray-50">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Общая выручка</p>
            <p className="text-lg font-bold text-green-600">
              +{stats.totalRevenue} млн руб
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Общая маржа</p>
            <p className="text-lg font-bold text-blue-600">
              +{stats.totalMargin} млн руб
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Фильтр:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status} {status !== 'Все' && `(${stats.byStatus[status] || 0})`}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Нет задач
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task.report_id)}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className="text-xs text-gray-500">
                  До {formatShortDate(task.due_date)}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-2">{task.description}</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-600">
                  Отчёт: <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTaskClick(task.report_id)
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    {reportNames[task.report_id] || task.report_id}
                  </button>
                  <span className="text-gray-400 ml-1">({task.report_id})</span>
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-gray-600">
                  Выручка: <strong className="text-green-600">+{task.revenue_impact_million} млн руб</strong>
                </span>
                <span className="text-gray-600">
                  Маржа: <strong className="text-blue-600">+{task.margin_impact_million} млн руб</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}