import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, FileText, Star, PlusCircle } from 'lucide-react'
import { getMatrixCell } from '../../utils/reportMapper'
import { getTrafficLightForLever } from '../../utils/trafficLight'
import { useAppStore } from '../../store/appStore'
import { ImpactBadges } from './ImpactBadges'

const STM_REPORT_IDS = ['NEW-REP-27', 'NEW-REP-28', 'NEW-REP-29']

interface LeverCardProps {
  lever: string
  column: string
  stepId: number
  status: 'not_viewed' | 'viewed' | 'analyzed'
  insights: string
  initiativeCount: number
  initiativeRevenue: number
  initiativeMargin: number
  onStatusChange: (status: 'not_viewed' | 'viewed' | 'analyzed') => void
  onInsightsChange: (insights: string) => void
}

export default function LeverCard({
  lever,
  column,
  stepId,
  status,
  insights,
  initiativeCount,
  initiativeRevenue,
  initiativeMargin,
  onStatusChange,
  onInsightsChange,
}: LeverCardProps) {
  const navigate = useNavigate()
  const { openAIChat } = useAppStore()
  const cell = getMatrixCell(lever, column)
  const trafficLight = getTrafficLightForLever(lever, column)

  // Sort: mandatory first, then by type (current → new)
  const sortedReports = useMemo(() => {
    if (!cell) return []
    return [...cell.reports].sort((a, b) => {
      if (a.isMandatory && !b.isMandatory) return -1
      if (!a.isMandatory && b.isMandatory) return 1
      return 0
    })
  }, [cell])

  if (!cell) return null

  const handleReportClick = (reportId: string) => {
    onStatusChange('viewed')
    navigate(`/report/${reportId}`, {
      state: { source: 'preparation', stepId, returnTo: `/preparation/step/${stepId}` },
    })
  }

  const handleAIClick = () => {
    openAIChat(cell)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{lever}</h4>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {initiativeCount > 0 && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                {initiativeCount} амб.
              </span>
            )}
            {(initiativeRevenue > 0 || initiativeMargin > 0) && (
              <ImpactBadges revenue={initiativeRevenue} margin={initiativeMargin} size="sm" />
            )}
          </div>
        </div>
        {status !== 'not_viewed' && (
          <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded mt-1">
            Просмотрено
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-2">
          {sortedReports.map((report) => {
            const isStm = STM_REPORT_IDS.includes(report.id)
            const isNew = report.type === 'new'

            let badgeClasses: string
            if (report.isMandatory) {
              badgeClasses = 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 font-medium text-blue-900'
            } else if (isStm) {
              badgeClasses = 'bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900'
            } else if (isNew) {
              badgeClasses = 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900'
            } else {
              badgeClasses = 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
            }

            return (
              <button
                key={report.id}
                onClick={() => handleReportClick(report.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${badgeClasses}`}
              >
                {report.isMandatory && <Star className="w-3 h-3 fill-blue-600 text-blue-600 flex-shrink-0" />}
                {isNew && <PlusCircle className={`w-3 h-3 flex-shrink-0 ${isStm ? 'text-amber-500' : 'text-emerald-500'}`} />}
                <FileText className={`w-4 h-4 flex-shrink-0 ${
                  report.isMandatory ? 'text-blue-600'
                    : isStm ? 'text-amber-600'
                    : isNew ? 'text-emerald-600'
                    : 'text-gray-500'
                }`} />
                <span>{report.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-600">Светофор (оценка ИИ):</span>
        <div className="flex gap-1" role="group" aria-label="Светофор">
          {(['red', 'yellow', 'green'] as const).map((light) => (
            <div
              key={light}
              className={`w-8 h-8 rounded-full border-2 transition-colors ${
                trafficLight === light
                  ? light === 'red'
                    ? 'bg-red-500 border-red-600'
                    : light === 'yellow'
                      ? 'bg-yellow-500 border-yellow-600'
                      : 'bg-green-500 border-green-600'
                  : 'bg-gray-100 border-gray-200'
              }`}
              title={light === 'red' ? 'Проблема' : light === 'yellow' ? 'Внимание' : 'Всё хорошо'}
            />
          ))}
        </div>
        <button
          onClick={handleAIClick}
          className="ml-auto p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
          title="ИИ-помощник"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">Выводы менеджера</label>
        <textarea
          value={insights}
          onChange={(e) => onInsightsChange(e.target.value)}
          placeholder="Заметки по анализу..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={3}
        />
      </div>
    </div>
  )
}
