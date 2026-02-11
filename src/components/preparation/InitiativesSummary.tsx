import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePreparationStore } from '../../store/preparationStore'
import { findCellByReportId } from '../../utils/reportMapper'
import { reportNames } from '../../utils/reportMapper'
import { formatShortDate, getStatusColor } from '../../utils/formatters'
import InitiativeForm from './InitiativeForm'
import { ImpactBadges } from './ImpactBadges'
import type { Task } from '../../types'
import { MATRIX_ROWS } from '../../utils/reportMapper'

export default function InitiativesSummary() {
  const navigate = useNavigate()
  const [filterLever, setFilterLever] = useState<string>('Все')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const {
    allInitiatives,
    addInitiative,
    removeInitiative,
    updateInitiative,
    completeStep,
    setCurrentStep,
  } = usePreparationStore()

  const getLeverForTask = (task: Task) => findCellByReportId(task.report_id)?.row ?? '—'

  const filteredInitiatives =
    filterLever === 'Все'
      ? allInitiatives
      : allInitiatives.filter((t) => getLeverForTask(t) === filterLever)

  const totalRevenue = allInitiatives.reduce((s, t) => s + t.revenue_impact_million, 0)
  const totalMargin = allInitiatives.reduce((s, t) => s + t.margin_impact_million, 0)

  const handleSave = (taskData: Omit<Task, 'id'> & { id?: number }) => {
    if (editingTask) {
      updateInitiative(editingTask.id, taskData)
      setEditingTask(null)
    } else {
      addInitiative(5, taskData)
    }
    setShowForm(false)
  }

  const handleNext = () => {
    completeStep(5)
    setCurrentStep(6)
    navigate('/preparation/step/6')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Инициативы и приоритизация</h2>
        <p className="text-gray-600 mt-1">
          Просмотрите, отредактируйте и приоритизируйте все накопленные инициативы
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-600 mb-2">Сумма инициатив</p>
        <ImpactBadges revenue={totalRevenue} margin={totalMargin} variant="compact" size="lg" />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
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
        <button
          onClick={() => {
            setEditingTask(null)
            setShowForm(true)
          }}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Добавить инициативу
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredInitiatives.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Нет инициатив. Добавьте инициативы на шагах 1–4 или здесь.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700">Описание</th>
                  <th className="text-left p-3 font-medium text-gray-700">Рычаг</th>
                  <th className="text-left p-3 font-medium text-gray-700">Отчёт</th>
                  <th className="text-left p-3 font-medium text-gray-700">Статус</th>
                  <th className="text-right p-3 font-medium text-gray-700">Выручка</th>
                  <th className="text-right p-3 font-medium text-gray-700">Маржа</th>
                  <th className="text-left p-3 font-medium text-gray-700">Срок</th>
                  <th className="p-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInitiatives.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-900">{task.description}</td>
                    <td className="p-3 text-gray-600">{getLeverForTask(task)}</td>
                    <td className="p-3 text-gray-600">
                      {reportNames[task.report_id] || task.report_id}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                        Выручка: +{task.revenue_impact_million} млн
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center text-xs px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
                        Маржа: +{task.margin_impact_million} млн
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{formatShortDate(task.due_date)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTask(task)
                            setShowForm(true)
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeInitiative(task.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
