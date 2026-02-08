import { Bot, FileText, Sparkles } from 'lucide-react'
import { MatrixCell as MatrixCellType } from '../../types'
import { getBadgeStyle, getProgressColor } from '../../utils/formatters'
import { useAppStore } from '../../store/appStore'

interface MatrixCellProps {
  cell: MatrixCellType
  onClick: () => void
  animationDelay?: number
}

export default function MatrixCell({ cell, onClick, animationDelay = 0 }: MatrixCellProps) {
  const { openAIChat } = useAppStore()
  
  const handleAIClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openAIChat(cell)
  }
  
  const badgeStyle = getBadgeStyle(cell.newReportsPercent)
  const progressColor = getProgressColor(cell.newReportsPercent)
  const progressPercent = cell.totalReports > 0 
    ? Math.round((cell.newReportsCount / cell.totalReports) * 100) 
    : 0
  
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
      
      {/* Metrics with icons */}
      <div className="space-y-2 mb-3 flex-grow">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span>
            <span className="font-semibold text-gray-800">{cell.totalReports}</span> отчётов
          </span>
        </div>
        {cell.newReportsCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span>
              <span className="font-semibold text-blue-600">{cell.newReportsCount}</span> новых
            </span>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      {cell.totalReports > 0 && (
        <div className="mt-auto pt-3 border-t border-gray-100 pr-10">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-500 ease-out`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
      
      {/* AI button - bottom right corner */}
      <button
        onClick={handleAIClick}
        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm hover:shadow-md z-10"
        title="Открыть ИИ-агента"
      >
        <Bot className="w-4 h-4 text-blue-600" />
      </button>
    </div>
  )
}