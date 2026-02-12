import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, X, Check } from 'lucide-react'
import { useReportTasks } from '../../hooks/useReports'
import { formatShortDate, getStatusColor } from '../../utils/formatters'
import type { Task } from '../../types'
import assigneesData from '../../data/assignees.json'

interface TasksListProps {
  reportId: string
}

export default function TasksList({ reportId }: TasksListProps) {
  const allTasks = useReportTasks(reportId)
  const [isAdding, setIsAdding] = useState(false)
  const [addParentId, setAddParentId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set())
  const [formData, setFormData] = useState({
    description: '',
    revenue_impact: '',
    margin_impact: '',
    start_date: '',
    assignee: ''
  })

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

  const assigneeOptions = [...assigneesData.departments, ...assigneesData.employees]

  const resetForm = () => {
    setFormData({
      description: '',
      revenue_impact: '',
      margin_impact: '',
      start_date: '',
      assignee: ''
    })
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setFormData({
      description: task.description,
      revenue_impact: String(task.revenue_impact_million),
      margin_impact: String(task.margin_impact_million),
      start_date: task.start_date || '',
      assignee: task.assignee || ''
    })
  }

  const handleAddTask = () => {
    if (formData.description.trim()) {
      console.log('Adding task:', {
        ...formData,
        parent_id: addParentId,
        report_id: reportId
      })
      resetForm()
      setIsAdding(false)
      setAddParentId(null)
    }
  }

  const handleSaveEdit = () => {
    if (formData.description.trim()) {
      console.log('Saving edit:', { id: editingId, ...formData })
      setEditingId(null)
      resetForm()
    }
  }

  const handleDelete = (taskId: number) => {
    console.log('Deleting task:', taskId)
  }

  const renderAddForm = (parentId: number | null) => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      {parentId && (
        <p className="text-xs text-blue-600 font-medium">Добавление подзадачи</p>
      )}
      <input
        type="text"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Описание амбиции"
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
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={formData.assignee}
          onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Ответственный...</option>
          {assigneeOptions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
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
            setAddParentId(null)
            resetForm()
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  )

  const renderTaskCard = (task: Task, isSubtask = false) => {
    const subtasks = isSubtask ? [] : getSubtasks(task.id)
    const isExpanded = expandedTasks.has(task.id)
    const isEditing = editingId === task.id

    if (isEditing) {
      return (
        <div key={task.id} className={`p-3 rounded-lg border-2 border-blue-300 bg-blue-50 space-y-2 ${isSubtask ? 'ml-6' : ''}`}>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={formData.revenue_impact}
              onChange={(e) => setFormData({ ...formData, revenue_impact: e.target.value })}
              placeholder="Выручка"
              className="p-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="p-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Ответственный...</option>
              {assigneeOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => { setEditingId(null); resetForm() }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <div key={task.id}>
        <div className={`p-3 rounded-lg border border-gray-200 ${
          isSubtask
            ? 'ml-6 bg-blue-50/50 border-blue-100'
            : 'bg-gray-50'
        }`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {!isSubtask && subtasks.length > 0 && (
                <button
                  onClick={() => toggleExpand(task.id)}
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
              {!isSubtask && (
                <button
                  onClick={() => {
                    setAddParentId(task.id)
                    setIsAdding(true)
                    resetForm()
                  }}
                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                  title="Добавить подзадачу"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => startEdit(task)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="Редактировать"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(task.id)}
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
            <div className="flex gap-4 text-xs text-gray-600">
              <span>Выручка: <strong className="text-green-600">+{task.revenue_impact_million} млн руб</strong></span>
              <span>Маржа: <strong className="text-blue-600">+{task.margin_impact_million} млн руб</strong></span>
            </div>
          )}
        </div>

        {/* Expanded subtasks */}
        {!isSubtask && isExpanded && (
          <div className="mt-1 space-y-1">
            {subtasks.map((sub) => renderTaskCard(sub, true))}
          </div>
        )}

        {/* Inline add subtask form */}
        {!isSubtask && isAdding && addParentId === task.id && (
          <div className="ml-6 mt-1">
            {renderAddForm(task.id)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Амбиции</h3>
        <button
          onClick={() => {
            setAddParentId(null)
            setIsAdding(!isAdding)
            resetForm()
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      {isAdding && addParentId === null && renderAddForm(null)}

      <div className="space-y-2">
        {rootTasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Нет амбиций
          </p>
        ) : (
          rootTasks.map((task) => renderTaskCard(task))
        )}
      </div>
    </div>
  )
}
