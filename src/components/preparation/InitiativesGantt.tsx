import { useMemo } from 'react'
import type { Task } from '../../types'
import { findCellByReportId } from '../../utils/reportMapper'

interface InitiativesGanttProps {
  initiatives: Task[]
}

export default function InitiativesGantt({ initiatives }: InitiativesGanttProps) {
  // Фильтруем инициативы с датами
  const validInitiatives = useMemo(() => {
    return initiatives.filter(
      (t) => t.start_date && t.impact_start_date && t.impact_check_date
    )
  }, [initiatives])

  // Вычисляем диапазон дат
  const { minDate, maxDate, months } = useMemo(() => {
    if (validInitiatives.length === 0) {
      const now = new Date()
      const future = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
      return {
        minDate: now,
        maxDate: future,
        months: generateMonths(now, future),
      }
    }

    const allDates = validInitiatives.flatMap((t) => [
      new Date(t.start_date!),
      new Date(t.impact_start_date!),
      new Date(t.impact_check_date!),
    ])

    const min = new Date(Math.min(...allDates.map((d) => d.getTime())))
    const max = new Date(Math.max(...allDates.map((d) => d.getTime())))

    // Добавляем по месяцу до и после
    min.setMonth(min.getMonth() - 1)
    max.setMonth(max.getMonth() + 1)

    return {
      minDate: min,
      maxDate: max,
      months: generateMonths(min, max),
    }
  }, [validInitiatives])

  // Функция для генерации месяцев
  function generateMonths(start: Date, end: Date) {
    const months: { label: string; date: Date }[] = []
    const current = new Date(start)
    current.setDate(1)

    while (current <= end) {
      months.push({
        label: current.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
        date: new Date(current),
      })
      current.setMonth(current.getMonth() + 1)
    }

    return months
  }

  // Вычисляем позицию даты на шкале (в процентах)
  function getDatePosition(date: Date): number {
    const totalMs = maxDate.getTime() - minDate.getTime()
    const dateMs = date.getTime() - minDate.getTime()
    return (dateMs / totalMs) * 100
  }

  // Накопительный импакт по месяцам
  const cumulativeImpact = useMemo(() => {
    const impact: Record<string, { revenue: number; margin: number }> = {}

    validInitiatives.forEach((task) => {
      if (!task.impact_start_date) return

      const startDate = new Date(task.impact_start_date)
      const monthKey = `${startDate.getFullYear()}-${startDate.getMonth()}`

      if (!impact[monthKey]) {
        impact[monthKey] = { revenue: 0, margin: 0 }
      }

      impact[monthKey].revenue += task.revenue_impact_million
      impact[monthKey].margin += task.margin_impact_million
    })

    return impact
  }, [validInitiatives])

  if (validInitiatives.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Нет инициатив с заполненными датами для отображения дорожной карты
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">Дорожная карта инициатив</h3>
        <p className="text-xs text-gray-600 mt-1">
          ⚫ Старт • 🟢 Начало эффекта • 🔵 Проверка импакта
        </p>
      </div>

      {/* Timeline header */}
      <div className="border-b bg-gray-50 px-4 py-2">
        <div className="flex">
          <div className="w-64 flex-shrink-0" />
          <div className="flex-1 flex">
            {months.map((m, idx) => (
              <div key={idx} className="flex-1 text-center text-xs text-gray-600">
                {m.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Initiatives */}
      <div className="divide-y">
        {validInitiatives.map((task) => {
          const lever = findCellByReportId(task.report_id)?.row ?? '—'
          const startPos = getDatePosition(new Date(task.start_date!))
          const impactStartPos = getDatePosition(new Date(task.impact_start_date!))
          const impactCheckPos = getDatePosition(new Date(task.impact_check_date!))

          return (
            <div key={task.id} className="flex hover:bg-gray-50 transition-colors">
              {/* Left column - task info */}
              <div className="w-64 flex-shrink-0 p-3 border-r">
                <p className="text-sm font-medium text-gray-900 truncate" title={task.description}>
                  {task.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{lever}</span>
                  {task.assignee && (
                    <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                      {task.assignee}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-emerald-700">
                    {task.revenue_impact_million} млн
                  </span>
                  <span className="text-xs text-blue-700">
                    {task.margin_impact_million} млн
                  </span>
                </div>
              </div>

              {/* Right column - timeline */}
              <div className="flex-1 p-3 relative">
                {/* Background line from start to impact check */}
                <div
                  className="absolute top-1/2 h-1 bg-gray-200 rounded"
                  style={{
                    left: `${startPos}%`,
                    right: `${100 - impactCheckPos}%`,
                    transform: 'translateY(-50%)',
                  }}
                />

                {/* Impact period (from impact_start to impact_check) */}
                <div
                  className="absolute top-1/2 h-1.5 bg-blue-400 rounded"
                  style={{
                    left: `${impactStartPos}%`,
                    right: `${100 - impactCheckPos}%`,
                    transform: 'translateY(-50%)',
                  }}
                />

                {/* Start marker */}
                <div
                  className="absolute top-1/2 w-3 h-3 bg-gray-900 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: `${startPos}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={`Старт: ${new Date(task.start_date!).toLocaleDateString('ru-RU')}`}
                />

                {/* Impact start marker */}
                <div
                  className="absolute top-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: `${impactStartPos}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={`Начало эффекта: ${new Date(task.impact_start_date!).toLocaleDateString('ru-RU')}`}
                />

                {/* Impact check marker */}
                <div
                  className="absolute top-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: `${impactCheckPos}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={`Проверка импакта: ${new Date(task.impact_check_date!).toLocaleDateString('ru-RU')}`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Cumulative impact */}
      <div className="border-t bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Накопительный импакт по месяцам</h4>
        <div className="flex gap-4">
          {months.map((m) => {
            const monthKey = `${m.date.getFullYear()}-${m.date.getMonth()}`
            const monthImpact = cumulativeImpact[monthKey]

            if (!monthImpact) return null

            return (
              <div key={monthKey} className="flex flex-col items-center">
                <span className="text-xs text-gray-600 mb-1">{m.label}</span>
                <div className="text-xs space-y-1">
                  <div className="text-emerald-700 font-medium">
                    +{monthImpact.revenue.toFixed(1)} млн
                  </div>
                  <div className="text-blue-700 font-medium">
                    +{monthImpact.margin.toFixed(1)} млн
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
