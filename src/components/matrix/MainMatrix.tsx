import { useNavigate } from 'react-router-dom'
import { ListTodo } from 'lucide-react'
import { useMatrixData } from '../../hooks/useMatrixData'
import { useAppStore } from '../../store/appStore'
import MatrixCell from './MatrixCell'
import ReportSelectionDialog from '../reports/ReportSelectionDialog'
import TasksPanel from '../tasks/TasksPanel'
import AIAgentChat from '../ai/AIAgentChat'

export default function MainMatrix() {
  const { rows, columns, getCell } = useMatrixData()
  const { selectedCell, setSelectedCell, isTasksPanelOpen, toggleTasksPanel } = useAppStore()
  const navigate = useNavigate()
  
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Category Review - Дикси
            </h1>
            <button
              onClick={toggleTasksPanel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <ListTodo className="w-5 h-5" />
              Задачи менеджера
            </button>
          </div>
        </div>
      </header>
      
      <main className="w-full px-2 sm:px-4 lg:px-6 py-8">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-xl">
              <table className="w-full border-collapse bg-white table-fixed" style={{ minWidth: '100%' }}>
                <colgroup>
                  <col style={{ width: '180px' }} />
                  {columns.map(() => (
                    <col key={Math.random()} style={{ minWidth: '200px', width: 'auto' }} />
                  ))}
                </colgroup>
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="p-3 text-left text-xs sm:text-sm font-bold text-gray-900 border-r border-gray-200 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-20">
                      Сущность / Контекст
                    </th>
                    {columns.map((col, idx) => (
                      <th
                        key={col}
                        className={`p-3 text-center text-xs sm:text-sm font-bold text-gray-900 ${
                          idx < columns.length - 1 ? 'border-r border-gray-200' : ''
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, rowIdx) => (
                    <tr key={row} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 bg-white text-xs sm:text-sm font-bold text-gray-900 border-r border-gray-200 sticky left-0 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                        {row}
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
                            {cell && cell.totalReports > 0 ? (
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
      </main>
      
      {selectedCell && (
        <ReportSelectionDialog
          cell={selectedCell}
          onClose={() => setSelectedCell(null)}
          onReportSelect={handleReportSelect}
        />
      )}
      
      {isTasksPanelOpen && (
        <TasksPanel onClose={toggleTasksPanel} />
      )}
      
      <AIAgentChat />
    </div>
  )
}