import { useState, useMemo } from 'react'
import { X, Filter, Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '../../hooks/useTasks'
import { formatShortDate, getStatusColor } from '../../utils/formatters'
import { reportNames } from '../../utils/reportMapper'
import type { Task } from '../../types'

interface TasksPanelProps {
  onClose: () => void
}

export default function TasksPanel({ onClose }: TasksPanelProps) {
  const [filter, setFilter] = useState<string>('Все')
  const { tasks: allTasks, stats } = useTasks(filter)
  const navigate = useNavigate()
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set())

  const statuses = ['Все', 'Новая', 'В работе', 'Выполнена', 'Просрочена']

  // Separate root tasks from subtasks
  const rootTasks = useMemo(() => allTasks.filter((t) => !t.parent_id), [allTasks])
  const getSubtasks = (parentId: number) => allTasks.filter((t) => t.parent_id === parentId)

  const toggleExpand = (taskId: number) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const handleTaskClick = (reportId: string) => {
    navigate(`/report/${reportId}`, {
      state: {
        source: 'tasks'
      }
    })
    onClose()
  }

  const handleDelete = (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation()
    console.log('Delete task:', taskId)
  }

  const handleEdit = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation()
    console.log('Edit task:', task.id)
  }

  const renderTaskCard = (task: Task, isSubtask = false) => {
    const subtasks = isSubtask ? [] : getSubtasks(task.id)
    const isExpanded = expandedTasks.has(task.id)

    return (
      <div key={task.id}>
        <div
          onClick={() => handleTaskClick(task.report_id)}
          className={`p-4 rounded-lg border hover:shadow-md cursor-pointer transition-shadow ${
            isSubtask
              ? 'ml-5 bg-blue-50/50 border-blue-100 p-3'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {!isSubtask && subtasks.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpand(task.id)
                  }}
                  className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
                  title={isExpanded ? 'Свернуть' : `Подзадачи (${subtasks.length})`}
                >
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                  }
                </button>
              )}
              {isSubtask && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              )}
              <span className={`px-2 py-1 text-xs rounded ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              {!isSubtask && subtasks.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gray-200 text-gray-600 font-medium">
                  {subtasks.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 mr-1">
                {formatShortDate(task.start_date)}
              </span>
              <button
                onClick={(e) => handleEdit(e, task)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="Редактировать"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => handleDelete(e, task.id)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="Удалить"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className={`font-medium text-gray-900 mb-2 ${isSubtask ? 'text-xs' : 'text-sm'}`}>
            {task.description}
          </p>
          {task.assignee && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-medium border border-purple-200">
                {task.assignee}
              </span>
            </div>
          )}
          {!isSubtask && (
            <>
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
            </>
          )}
        </div>

        {/* Expanded subtasks */}
        {!isSubtask && isExpanded && (
          <div className="mt-1 space-y-1">
            {subtasks.map((sub) => renderTaskCard(sub, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white">
        <h2 className="text-lg font-semibold">Амбиции менеджера</h2>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {rootTasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Нет амбиций
          </p>
        ) : (
          rootTasks.map((task) => renderTaskCard(task))
        )}
      </div>
    </div>
  )
}
