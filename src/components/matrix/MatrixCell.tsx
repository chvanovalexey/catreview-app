import { Sparkles } from 'lucide-react'
import { MatrixCell as MatrixCellType } from '../../types'
import { HEALTH_GRADIENT } from '../../utils/formatters'
import { useAppStore } from '../../store/appStore'
import reportHealth from '../../data/report_health.json'

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

export default function MatrixCell({ cell, onClick, animationDelay = 0 }: MatrixCellProps) {
  const { openAIChat } = useAppStore()
  
  const handleAIClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openAIChat(cell)
  }
  
  const healthPercent = getCellHealth(cell)
  
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative group ring-1 ring-transparent hover:ring-blue-200 animate-fade-in-up h-full flex flex-col min-h-[140px]"
      style={{ 
        animationDelay: `${animationDelay}ms`
      }}
      onClick={onClick}
    >
      {/* Header with title */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800 leading-tight">
          {cell.description || `${cell.row} - ${cell.column}`}
        </h3>
      </div>
      
      <div className="flex-grow" />
      
      {/* Progress bar - здоровье ячейки. Градиент красный→зелёный на всю длину; видимая часть — левые health% (при 50% — красный→жёлтый) */}
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