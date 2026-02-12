import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, AlertCircle, List, BarChart3, Maximize2, Minimize2, ChevronRight, ChevronDown } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { usePreparationStore } from '../../store/preparationStore'
import { findCellByReportId } from '../../utils/reportMapper'
import { reportNames } from '../../utils/reportMapper'
import { formatShortDate, getStatusColor } from '../../utils/formatters'
import InitiativeForm from './InitiativeForm'
import { ImpactBadges } from './ImpactBadges'
import type { Task } from '../../types'
import { MATRIX_ROWS } from '../../utils/reportMapper'
import { calculateInitiativeDetailScore, getScoreColorClass } from '../../utils/initiativeScoring'
import InitiativesGantt from './InitiativesGantt'

export default function InitiativesSummary() {
  const navigate = useNavigate()
  const [filterLever, setFilterLever] = useState<string>('Все')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addSubtaskParentId, setAddSubtaskParentId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'gantt'>('table')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set())

  // Escape to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const {
    allInitiatives,
    addInitiative,
    removeInitiative,
    updateInitiative,
    completeStep,
    setCurrentStep,
  } = usePreparationStore()

  const getLeverForTask = (task: Task) => findCellByReportId(task.report_id)?.row ?? '—'

  // Separate root tasks (no parent_id) from subtasks
  const rootInitiatives = allInitiatives.filter((t) => !t.parent_id)
  const getSubtasks = (parentId: number) => allInitiatives.filter((t) => t.parent_id === parentId)

  const filteredInitiatives =
    filterLever === 'Все'
      ? rootInitiatives
      : rootInitiatives.filter((t) => getLeverForTask(t) === filterLever)

  const toggleExpand = (taskId: number) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const totalRevenue = rootInitiatives.reduce((s, t) => s + t.revenue_impact_million, 0)
  const totalMargin = rootInitiatives.reduce((s, t) => s + t.margin_impact_million, 0)
  
  // Средняя оценка проработанности всех инициатив (только для корневых)
  const averageScore = rootInitiatives.length > 0
    ? Math.round(
        rootInitiatives.reduce((s, t) => s + calculateInitiativeDetailScore(t, allInitiatives).score, 0) / 
        rootInitiatives.length
      )
    : 0

  const handleSave = (taskData: Omit<Task, 'id'> & { id?: number }) => {
    if (editingTask) {
      updateInitiative(editingTask.id, taskData)
      setEditingTask(null)
    } else {
      // If adding a subtask, inject parent_id
      const data = addSubtaskParentId
        ? { ...taskData, parent_id: addSubtaskParentId }
        : taskData
      addInitiative(6, data)
      if (addSubtaskParentId) {
        // Auto-expand the parent after adding subtask
        setExpandedTasks((prev) => new Set(prev).add(addSubtaskParentId))
      }
    }
    setAddSubtaskParentId(null)
    setShowForm(false)
  }

  const handleNext = () => {
    completeStep(6)
    setCurrentStep(7)
    navigate('/preparation/step/7')
  }

  const filterBar = (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      {/* Fullscreen toggle */}
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        title={isFullscreen ? 'Свернуть' : 'Развернуть на весь экран'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      <span className="text-sm font-medium text-gray-700">Фильтр по рычагу:</span>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterLever('Все')}
          className={`px-3 py-1 text-sm rounded-lg ${
            filterLever === 'Все' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Все
        </button>
        {MATRIX_ROWS.map((lever) => (
          <button
            key={lever}
            onClick={() => setFilterLever(lever)}
            className={`px-3 py-1 text-sm rounded-lg ${
              filterLever === lever ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {lever}
          </button>
        ))}
      </div>
      
      {/* View mode toggle */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => setViewMode('table')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <List className="w-4 h-4" />
          Таблица
        </button>
        <button
          onClick={() => setViewMode('gantt')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            viewMode === 'gantt' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Дорожная карта
        </button>
      </div>
      
      <button
        onClick={() => {
          setEditingTask(null)
          setShowForm(true)
        }}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Plus className="w-4 h-4" />
        Добавить амбицию
      </button>
    </div>
  )

  const tableView = (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {filteredInitiatives.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Нет амбиций. Добавьте амбиции на шагах 1–4 или здесь.
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-auto">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">Описание</th>
              <th className="text-left p-3 font-medium text-gray-700">Рычаг</th>
              <th className="text-left p-3 font-medium text-gray-700">Отчёт</th>
              <th className="text-left p-3 font-medium text-gray-700">Ответственный</th>
              <th className="text-center p-3 font-medium text-gray-700">Проработка</th>
              <th className="text-left p-3 font-medium text-gray-700">Статус</th>
              <th className="text-right p-3 font-medium text-gray-700 whitespace-nowrap">Выручка, млн.р.</th>
              <th className="text-right p-3 font-medium text-gray-700 whitespace-nowrap">Маржа, млн.р.</th>
              <th className="text-left p-3 font-medium text-gray-700">Начало</th>
              <th className="text-left p-3 font-medium text-gray-700 whitespace-nowrap">Эффект с</th>
              <th className="text-left p-3 font-medium text-gray-700">Проверка</th>
              <th className="p-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInitiatives.map((task) => {
              const scoreData = calculateInitiativeDetailScore(task, allInitiatives)
              const subtasks = getSubtasks(task.id)
              const isExpanded = expandedTasks.has(task.id)
              return (
              <>{/* Parent row */}
              <tr key={task.id} className="hover:bg-gray-50 group">
                <td className="p-3 text-gray-900">
                  <div className="relative flex items-center gap-2 pr-6">
                    {subtasks.length > 0 ? (
                      <button
                        onClick={() => toggleExpand(task.id)}
                        className="p-0.5 rounded hover:bg-gray-200 text-gray-500 flex-shrink-0"
                        title={isExpanded ? 'Свернуть подзадачи' : `Подзадачи (${subtasks.length})`}
                      >
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />
                        }
                      </button>
                    ) : (
                      <span className="w-5 flex-shrink-0" />
                    )}
                    <span>{task.description}</span>
                    {subtasks.length > 0 && (
                      <span className="absolute top-0 right-0 px-1.5 py-0.5 text-[10px] rounded-full bg-gray-200 text-gray-600 font-medium leading-none">
                        {subtasks.length}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setAddSubtaskParentId(task.id)
                        setEditingTask(null)
                        setShowForm(true)
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-green-600 bg-green-100 hover:bg-green-200 border border-green-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Добавить подзадачу"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="p-3 text-gray-600">{getLeverForTask(task)}</td>
                <td className="p-3">
                  <Link
                    to={`/report/${task.report_id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {reportNames[task.report_id] || task.report_id}
                  </Link>
                </td>
                <td className="p-3 text-gray-600">
                  {task.assignee ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                      {task.assignee}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Не назначен</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className={`inline-flex items-center text-xs px-2 py-1 rounded-md border font-semibold ${getScoreColorClass(scoreData.score)}`}>
                      {scoreData.score}%
                    </span>
                    {scoreData.recommendations.length > 0 && (
                      <button
                        title={scoreData.recommendations.join('\n')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <AlertCircle className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="p-3 text-right text-gray-900 font-medium">
                  +{task.revenue_impact_million}
                </td>
                <td className="p-3 text-right text-gray-900 font-medium">
                  +{task.margin_impact_million}
                </td>
                <td className="p-3 text-gray-600 whitespace-nowrap">{formatShortDate(task.start_date)}</td>
                <td className="p-3 text-gray-600 whitespace-nowrap">{task.impact_start_date ? formatShortDate(task.impact_start_date) : '—'}</td>
                <td className="p-3 text-gray-600 whitespace-nowrap">{task.impact_check_date ? formatShortDate(task.impact_check_date) : '—'}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setAddSubtaskParentId(null)
                        setEditingTask(task)
                        setShowForm(true)
                      }}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Редактировать"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeInitiative(task.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              {/* Subtask rows */}
              {isExpanded && subtasks.map((sub) => (
                <tr key={sub.id} className="bg-blue-50/40 hover:bg-blue-50/70">
                  <td className="p-3 text-gray-700">
                    <div className="flex items-center gap-2 pl-7">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      <span className="text-sm">{sub.description}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">—</td>
                  <td className="p-3 text-gray-500 text-xs">—</td>
                  <td className="p-3 text-gray-600">
                    {sub.assignee ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[11px] font-medium border border-purple-100">
                        {sub.assignee}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center text-gray-400 text-xs">—</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-gray-400 text-xs">—</td>
                  <td className="p-3 text-right text-gray-400 text-xs">—</td>
                  <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{formatShortDate(sub.start_date)}</td>
                  <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{sub.impact_start_date ? formatShortDate(sub.impact_start_date) : '—'}</td>
                  <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{sub.impact_check_date ? formatShortDate(sub.impact_check_date) : '—'}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setAddSubtaskParentId(null)
                          setEditingTask(sub)
                          setShowForm(true)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Редактировать подзадачу"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeInitiative(sub.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Удалить подзадачу"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </>
              )
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Амбиции и приоритизация</h2>
          <button
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title="Свернуть"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="text-sm">Свернуть</span>
          </button>
        </div>

        {filterBar}

        {viewMode === 'gantt' ? (
          <InitiativesGantt initiatives={filteredInitiatives} />
        ) : (
          tableView
        )}

        {showForm && (
          <InitiativeForm
            initialData={editingTask ?? undefined}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false)
              setEditingTask(null)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Амбиции и приоритизация</h2>
        <p className="text-gray-600 mt-1">
          Просмотрите, отредактируйте и приоритизируйте все накопленные амбиции
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-xs text-gray-600 mb-2">Сумма амбиций</p>
          <ImpactBadges revenue={totalRevenue} margin={totalMargin} variant="compact" size="lg" />
        </div>
        {allInitiatives.length > 0 && (
          <div>
            <p className="text-xs text-gray-600 mb-2">Средняя проработанность</p>
            <span className={`inline-flex items-center text-sm px-3 py-1 rounded border font-semibold ${getScoreColorClass(averageScore)}`}>
              {averageScore}%
            </span>
          </div>
        )}
      </div>

      {filterBar}

      {viewMode === 'gantt' ? (
        <InitiativesGantt initiatives={filteredInitiatives} />
      ) : (
        tableView
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          К финализации
        </button>
      </div>

      {showForm && (
        <InitiativeForm
          initialData={editingTask ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
