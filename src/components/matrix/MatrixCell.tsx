import { Sparkles } from 'lucide-react'
import { MatrixCell as MatrixCellType } from '../../types'
import { useAppStore } from '../../store/appStore'

/** Цвет по значению: 0 — красный, 100 — зелёный (доля новых отчётов) */
function getProgressBarColor(percent: number): string {
  if (percent <= 0) return 'rgb(239, 68, 68)' // red-500
  if (percent >= 100) return 'rgb(16, 185, 129)' // emerald-500
  const hue = (percent / 100) * 120
  return `hsl(${hue}, 84%, 47%)`
}
import tasksData from '../../data/tasks.json'
import { Task } from '../../types'

interface MatrixCellProps {
  cell: MatrixCellType
  onClick: () => void
  animationDelay?: number
}

function getCellImpact(cell: MatrixCellType): { revenue: number; margin: number } {
  const reportIds = new Set(cell.reports.map(r => r.id))
  const tasks = tasksData as Task[]
  const cellTasks = tasks.filter(t => reportIds.has(t.report_id))
  return cellTasks.reduce(
    (acc, t) => ({
      revenue: acc.revenue + t.revenue_impact_million,
      margin: acc.margin + t.margin_impact_million
    }),
    { revenue: 0, margin: 0 }
  )
}

export default function MatrixCell({ cell, onClick, animationDelay = 0 }: MatrixCellProps) {
  const { openAIChat } = useAppStore()
  
  const handleAIClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openAIChat(cell)
  }
  
  const progressPercent = cell.newReportsPercent
  const impact = getCellImpact(cell)
  
  // Процент готовности = (количество текущих отчётов / общее количество) × 100%
  const currentReportsCount = cell.reports.filter(r => r.type === 'current').length
  const readinessPercent = cell.totalReports > 0 
    ? Math.round((currentReportsCount / cell.totalReports) * 100) 
    : 0
  
  // Цвет бейджа готовности
  const getReadinessColor = (percent: number) => {
    if (percent < 40) return 'bg-red-100 text-red-800 border-red-300'
    if (percent < 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }
  
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative group ring-1 ring-transparent hover:ring-blue-200 animate-fade-in-up h-full flex flex-col min-h-[120px]"
      style={{ 
        animationDelay: `${animationDelay}ms`
      }}
      onClick={onClick}
    >
      {/* Question badges - min-h на 3 вопроса (эталон), отступ справа для бейджей выручки/маржа/готовность */}
      <div className="flex flex-col gap-2 mb-2 flex-grow pr-20 md:pr-[7.5rem] pl-3 min-h-[6.5rem]">
        {(cell.questions || []).map((q, idx) => (
          <span
            key={idx}
            className="inline-block text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-md border border-gray-200 leading-tight w-full max-w-full truncate"
            title={q}
          >
            {q}
          </span>
        ))}
      </div>

      {/* Impact badges + readiness - right side, aligned with AI icon. gap-2 как у бейджей вопросов */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
        <span className="inline-flex items-center text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 whitespace-nowrap">
          <span className="hidden md:inline">Выручка: </span>
          {impact.revenue} млн
        </span>
        <span className="inline-flex items-center text-xs px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200 whitespace-nowrap">
          <span className="hidden md:inline">Маржа: </span>
          {impact.margin} млн
        </span>
        <span className={`inline-flex items-center text-xs px-2 py-1 rounded-md border font-semibold ${getReadinessColor(readinessPercent)}`}>
          {readinessPercent}%
        </span>
      </div>
      
      {/* Progress bar */}
      {cell.totalReports > 0 && (
        <div className="mt-auto pt-2 border-t border-gray-100 pr-10">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full overflow-hidden" style={{ width: `${progressPercent}%` }}>
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{ backgroundColor: getProgressBarColor(progressPercent), width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* AI button - bottom right corner */}
      <button
        onClick={handleAIClick}
        className="absolute bottom-3 right-3 p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm hover:shadow-md z-10"
        title="Открыть ИИ-агента"
      >
        <Sparkles className="w-4 h-4 text-blue-600" />
      </button>
    </div>
  )
}
