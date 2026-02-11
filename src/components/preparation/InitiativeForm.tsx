import { useState } from 'react'
import { X } from 'lucide-react'
import type { Task } from '../../types'
import { reportNames } from '../../utils/reportMapper'
import { findCellByReportId } from '../../utils/reportMapper'
const REPORT_IDS = Object.keys(reportNames)
const STATUSES: Task['status'][] = ['Новая', 'В работе', 'Выполнена', 'Просрочена']

interface InitiativeFormProps {
  initialData?: Partial<Task> & { id?: number }
  onSave: (task: Omit<Task, 'id'> & { id?: number }) => void
  onClose: () => void
}

export default function InitiativeForm({
  initialData,
  onSave,
  onClose,
}: InitiativeFormProps) {
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [report_id, setReportId] = useState(initialData?.report_id ?? REPORT_IDS[0])
  const [revenue_impact_million, setRevenueImpact] = useState(
    initialData?.revenue_impact_million ?? 0
  )
  const [margin_impact_million, setMarginImpact] = useState(
    initialData?.margin_impact_million ?? 0
  )
  const [due_date, setDueDate] = useState(
    initialData?.due_date ?? new Date().toISOString().split('T')[0]
  )
  const [status, setStatus] = useState<Task['status']>(initialData?.status ?? 'Новая')

  const lever = findCellByReportId(report_id)?.row ?? '—'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: initialData?.id,
      description,
      report_id,
      status,
      revenue_impact_million,
      margin_impact_million,
      due_date,
      created_date: initialData?.created_date ?? new Date().toISOString().split('T')[0],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Редактировать инициативу' : 'Добавить инициативу'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Опишите инициативу..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Отчёт</label>
            <select
              value={report_id}
              onChange={(e) => setReportId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {REPORT_IDS.map((id) => (
                <option key={id} value={id}>
                  {reportNames[id]} ({id})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Рычаг: {lever}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Выручка</label>
              <input
                type="number"
                value={revenue_impact_million || ''}
                onChange={(e) =>
                  setRevenueImpact(e.target.value ? parseFloat(e.target.value) : 0)
                }
                min={0}
                step={0.5}
                placeholder="млн руб"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Маржа</label>
              <input
                type="number"
                value={margin_impact_million || ''}
                onChange={(e) =>
                  setMarginImpact(e.target.value ? parseFloat(e.target.value) : 0)
                }
                min={0}
                step={0.5}
                placeholder="млн руб"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Срок</label>
            <input
              type="date"
              value={due_date}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {initialData ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
