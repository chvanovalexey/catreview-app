import { Sparkles } from 'lucide-react'
import { MatrixCell as MatrixCellType } from '../../types'
import { HEALTH_GRADIENT } from '../../utils/formatters'
import { useAppStore } from '../../store/appStore'
import reportHealth from '../../data/report_health.json'
import tasksData from '../../data/tasks.json'
import { Task } from '../../types'

interface MatrixCellProps {
  cell: MatrixCellType
  onClick: () => void
  animationDelay?: number
}

const reportHealthMap = reportHealth as Record<string, number>

function getCellHealth(cell: MatrixCellType): number {
  if (cell.reports.length === 0) return 0
  const sum = cell.reports.reduce((acc, r) => acc + (reportHealthMap[r.id] ?? 50), 0)
  return Math.round(sum / cell.reports.length)
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
  
  const healthPercent = getCellHealth(cell)
  const impact = getCellImpact(cell)
  
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative group ring-1 ring-transparent hover:ring-blue-200 animate-fade-in-up h-full flex flex-col min-h-[160px]"
      style={{ 
        animationDelay: `${animationDelay}ms`
      }}
      onClick={onClick}
    >
      {/* Question badges stacked vertically */}
      <div className="flex flex-col gap-2 mb-3 flex-grow min-h-0">
        {(cell.questions || []).map((q, idx) => (
          <span
            key={idx}
            className="inline-block text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-md border border-gray-200 leading-tight"
          >
            {q}
          </span>
        ))}
      </div>
      
      {/* Progress bar */}
      {cell.totalReports > 0 && (
        <div className="mt-auto pt-3 border-t border-gray-100 pr-10">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full overflow-hidden" style={{ width: `${healthPercent}%` }}>
              <div
                className={`h-full bg-gradient-to-r ${HEALTH_GRADIENT} transition-all duration-500 ease-out`}
                style={{ width: healthPercent > 0 ? `${100 / healthPercent * 100}%` : 0 }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Impact badge at bottom */}
      <div className="mt-2 flex gap-2 flex-wrap pr-10">
        <span className="inline-flex items-center text-xs px-2 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
          Выручка: {impact.revenue} млн
        </span>
        <span className="inline-flex items-center text-xs px-2 py-1 bg-blue-50 text-blue-800 rounded border border-blue-200">
          Маржа: {impact.margin} млн
        </span>
      </div>
      
      {/* AI button - bottom right corner */}
      <button
        onClick={handleAIClick}
        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm hover:shadow-md z-10"
        title="Открыть ИИ-агента"
      >
        <Sparkles className="w-4 h-4 text-blue-600" />
      </button>
    </div>
  )
}
