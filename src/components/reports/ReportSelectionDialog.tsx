import { X } from 'lucide-react'
import { MatrixCell } from '../../types'
import { HEALTH_GRADIENT } from '../../utils/formatters'
import reportHealth from '../../data/report_health.json'

interface ReportSelectionDialogProps {
  cell: MatrixCell
  onClose: () => void
  onReportSelect: (reportId: string) => void
}

export default function ReportSelectionDialog({
  cell,
  onClose,
  onReportSelect,
}: ReportSelectionDialogProps) {
  const reportHealthMap = reportHealth as Record<string, number>
  const currentReports = cell.reports.filter(r => r.type === 'current')
  const newReports = cell.reports.filter(r => r.type === 'new')
  
  const ReportButton = ({ report, type }: { report: { id: string; title: string }; type: 'current' | 'new' }) => {
    const healthPercent = reportHealthMap[report.id] ?? 50
    const baseClass = type === 'current'
      ? 'w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors'
      : 'w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors'
    const badgeClass = type === 'current'
      ? 'text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded ml-2'
      : 'text-xs px-2 py-1 bg-blue-500 text-white rounded ml-2'
    return (
      <button
        key={report.id}
        onClick={() => onReportSelect(report.id)}
        className={baseClass}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900">{report.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{report.id}</div>
          </div>
          <span className={`${badgeClass} flex-shrink-0`}>{type === 'current' ? 'Текущий' : 'Новый'}</span>
        </div>
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full overflow-hidden" style={{ width: `${healthPercent}%` }}>
            <div
              className={`h-full bg-gradient-to-r ${HEALTH_GRADIENT} transition-all duration-500`}
              style={{ width: healthPercent > 0 ? `${100 / healthPercent * 100}%` : 0 }}
            />
          </div>
        </div>
      </button>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Отчёты: {cell.row} - {cell.column}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentReports.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Текущие отчёты ({currentReports.length})
              </h3>
              <div className="space-y-2">
                {currentReports.map((report) => (
                  <ReportButton key={report.id} report={report} type="current" />
                ))}
              </div>
            </div>
          )}
          
          {newReports.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Новые отчёты ({newReports.length})
              </h3>
              <div className="space-y-2">
                {newReports.map((report) => (
                  <ReportButton key={report.id} report={report} type="new" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}