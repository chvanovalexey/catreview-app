import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useMatrixData } from '../../hooks/useMatrixData'
import { useAppStore } from '../../store/appStore'
import MatrixCell from './MatrixCell'
import ReportSelectionDialog from '../reports/ReportSelectionDialog'
import AIAgentChat from '../ai/AIAgentChat'

// Парсит текст вида "Что-то (Badge)" и возвращает основной текст + бейдж
function parseHeaderWithBadge(text: string) {
  const match = text.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
  if (match) {
    return { main: match[1].trim(), badge: match[2] }
  }
  return { main: text, badge: null }
}

const HIDDEN_BADGES = ['Merch']

function HeaderWithBadge({ text, align = 'center' }: { text: string; align?: 'left' | 'center' }) {
  const { main, badge } = parseHeaderWithBadge(text)
  const showBadge = badge && !HIDDEN_BADGES.includes(badge)
  return (
    <span className={`flex flex-col gap-1 ${align === 'left' ? 'items-start' : 'items-center'}`}>
      <span>{main}</span>
      {showBadge && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
          {badge}
        </span>
      )}
    </span>
  )
}

export default function MainMatrix() {
  const { rows, columns, getCell } = useMatrixData()
  const { selectedCell, setSelectedCell } = useAppStore()
  const navigate = useNavigate()

  // Рассчитываем общий процент готовности матрицы
  const calculateOverallReadiness = () => {
    let totalReadiness = 0
    let cellCount = 0
    
    rows.forEach(row => {
      columns.forEach(col => {
        const cell = getCell(row, col)
        if (cell && cell.totalReports > 0) {
          const currentReportsCount = cell.reports.filter(r => r.type === 'current').length
          const readiness = (currentReportsCount / cell.totalReports) * 100
          totalReadiness += readiness
          cellCount++
        }
      })
    })
    
    return cellCount > 0 ? Math.round(totalReadiness / cellCount) : 0
  }
  
  const overallReadiness = calculateOverallReadiness()
  const getReadinessColor = (percent: number) => {
    if (percent < 40) return 'bg-red-100 text-red-800 border-red-300'
    if (percent < 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  const handleCellClick = (row: string, column: string) => {
    const cell = getCell(row, column)
    if (cell) {
      setSelectedCell(cell)
    }
  }
  
  const handleReportSelect = (reportId: string) => {
    // Сохраняем информацию о ячейке в location.state для восстановления модального окна при возврате
    navigate(`/report/${reportId}`, {
      state: { 
        source: 'dialog',
        cell: selectedCell 
      }
    })
    setSelectedCell(null)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-30 backdrop-blur-sm bg-white/95">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
              <img src="/logo/dixy.svg" alt="Дикси" className="h-8 w-auto" />
              <img src="/logo/glowbyte.svg" alt="Глоубайт" className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-3 hidden sm:flex flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">
                Category Review
              </h1>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs text-gray-600">Готовность отчётов:</span>
                <span className={`inline-flex items-center text-xs px-3 py-1 rounded-md border font-semibold ${getReadinessColor(overallReadiness)}`}>
                  {overallReadiness}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 flex-1 sm:flex-initial min-w-0">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">На главную</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="w-full px-2 sm:px-4 lg:px-6 py-8">
        {/* Десктоп: таблица */}
        <div className="hidden sm:block overflow-x-auto">
          <div className="inline-block align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-xl">
              <table
                className="border-collapse bg-white table-auto md:table-fixed"
              >
                <colgroup>
                  <col className="hidden md:table-column md:w-[200px]" />
                  {columns.map((col) => (
                    <col key={col} className="min-w-[220px]" />
                  ))}
                </colgroup>
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="p-3 text-left text-xs sm:text-sm font-bold text-gray-900 border-r border-gray-200 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-20 hidden md:table-cell">
                      <HeaderWithBadge text="Рычаг (Lever)" align="left" />
                    </th>
                    {columns.map((col, idx) => (
                      <th
                        key={col}
                        className={`p-3 text-center text-xs sm:text-sm font-bold text-gray-900 ${
                          idx < columns.length - 1 ? 'border-r border-gray-200' : ''
                        }`}
                      >
                        <HeaderWithBadge text={col} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, rowIdx) => (
                    <tr key={row} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 bg-white text-xs sm:text-sm font-bold text-gray-900 border-r border-gray-200 sticky left-0 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)] hidden md:table-cell">
                        <HeaderWithBadge text={row} align="left" />
                      </td>
                      {columns.map((col, colIdx) => {
                        const cell = getCell(row, col)
                        const cellIndex = rowIdx * columns.length + colIdx
                        const animationDelay = cellIndex * 30 // 30ms delay between cells
                        return (
                          <td 
                            key={`${row}-${col}`} 
                            className={`p-2 align-top ${
                              colIdx < columns.length - 1 ? 'border-r border-gray-100' : ''
                            }`}
                            style={{ height: '100%', verticalAlign: 'top' }}
                          >
                            {cell ? (
                              <MatrixCell
                                cell={cell}
                                onClick={() => handleCellClick(row, col)}
                                animationDelay={animationDelay}
                              />
                            ) : (
                              <div 
                                className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 text-center flex flex-col items-center justify-center h-full min-h-[140px] animate-fade-in-up"
                                style={{ 
                                  animationDelay: `${animationDelay}ms`
                                }}
                              >
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                                  <span className="text-gray-400">—</span>
                                </div>
                                Нет данных
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Мобильная: блоки колонок друг под другом */}
        <div className="sm:hidden flex flex-col gap-8">
          {columns.map((col, colIdx) => {
            const cellBaseIndex = colIdx * rows.length
            return (
              <div
                key={col}
                className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-xl bg-white"
              >
                <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h2 className="text-sm font-bold text-gray-900 text-center">
                    <HeaderWithBadge text={col} />
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {rows.map((row, rowIdx) => {
                    const cell = getCell(row, col)
                    const cellIndex = cellBaseIndex + rowIdx
                    const animationDelay = cellIndex * 30
                    return (
                      <div key={`${row}-${col}`} className="p-2">
                        <div className="text-xs font-bold text-gray-700 mb-2">
                          <HeaderWithBadge text={row} align="left" />
                        </div>
                        {cell ? (
                          <MatrixCell
                            cell={cell}
                            onClick={() => handleCellClick(row, col)}
                            animationDelay={animationDelay}
                          />
                        ) : (
                          <div
                            className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 text-center flex flex-col items-center justify-center min-h-[140px] animate-fade-in-up"
                            style={{ animationDelay: `${animationDelay}ms` }}
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                              <span className="text-gray-400">—</span>
                            </div>
                            Нет данных
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </main>
      
      {selectedCell && (
        <ReportSelectionDialog
          cell={selectedCell}
          onClose={() => setSelectedCell(null)}
          onReportSelect={handleReportSelect}
        />
      )}
      
      <AIAgentChat />
    </div>
  )
}