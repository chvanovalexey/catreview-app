import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, Maximize2, Move } from 'lucide-react'
import GanttChart, { type DetailLevel } from './GanttChart'
import { clsx } from 'clsx'

const DETAIL_LABELS: Record<DetailLevel, string> = {
  week: 'Неделя',
  month: 'Месяц',
  quarter: 'Квартал',
}

export default function ScheduleScreen() {
  const navigate = useNavigate()
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('month')
  const [fitToWidth, setFitToWidth] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-20 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Назад
              </button>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  График пересмотра категорий
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Детализация:</span>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {(['week', 'month', 'quarter'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDetailLevel(level)}
                  className={clsx(
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    detailLevel === level
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {DETAIL_LABELS[level]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Размер:</span>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setFitToWidth(true)}
                title="Выровнять по ширине"
                className={clsx(
                  'flex items-center justify-center p-2 rounded-md transition-colors',
                  fitToWidth
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Maximize2 className="w-5 h-5 shrink-0" />
              </button>
              <button
                onClick={() => setFitToWidth(false)}
                title="Не выравнивать"
                className={clsx(
                  'flex items-center justify-center p-2 rounded-md transition-colors',
                  !fitToWidth
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Move className="w-5 h-5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <GanttChart detailLevel={detailLevel} fitToWidth={fitToWidth} />
      </main>
    </div>
  )
}
