import { X } from 'lucide-react'
import { MatrixCell } from '../../types'

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
  const currentReports = cell.reports.filter(r => r.type === 'current')
  const newReports = cell.reports.filter(r => r.type === 'new')
  
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
                  <button
                    key={report.id}
                    onClick={() => onReportSelect(report.id)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{report.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{report.id}</div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded ml-2">
                        Текущий
                      </span>
                    </div>
                  </button>
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
                  <button
                    key={report.id}
                    onClick={() => onReportSelect(report.id)}
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{report.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{report.id}</div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded ml-2">
                        Новый
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}