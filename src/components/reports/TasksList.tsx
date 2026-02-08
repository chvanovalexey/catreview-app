import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useReportTasks } from '../../hooks/useReports'
import { formatShortDate, getStatusColor } from '../../utils/formatters'

interface TasksListProps {
  reportId: string
}

export default function TasksList({ reportId }: TasksListProps) {
  const tasks = useReportTasks(reportId)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    revenue_impact: '',
    margin_impact: '',
    due_date: ''
  })
  
  const handleAddTask = () => {
    if (formData.description.trim()) {
      // Mock: In real app, this would call an API
      console.log('Adding task:', formData)
      setFormData({
        description: '',
        revenue_impact: '',
        margin_impact: '',
        due_date: ''
      })
      setIsAdding(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Задачи</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>
      
      {isAdding && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Описание задачи"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={formData.revenue_impact}
              onChange={(e) => setFormData({ ...formData, revenue_impact: e.target.value })}
              placeholder="Выручка (млн руб)"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={formData.margin_impact}
              onChange={(e) => setFormData({ ...formData, margin_impact: e.target.value })}
              placeholder="Маржа (млн руб)"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setFormData({
                  description: '',
                  revenue_impact: '',
                  margin_impact: '',
                  due_date: ''
                })
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Нет задач
          </p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className="text-xs text-gray-500">
                  До {formatShortDate(task.due_date)}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-2">{task.description}</p>
              <div className="flex gap-4 text-xs text-gray-600">
                <span>Выручка: <strong className="text-green-600">+{task.revenue_impact_million} млн руб</strong></span>
                <span>Маржа: <strong className="text-blue-600">+{task.margin_impact_million} млн руб</strong></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}