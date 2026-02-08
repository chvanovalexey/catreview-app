import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Bot, MessageSquare, CheckSquare } from 'lucide-react'
import { useReportComments, useReportTasks } from '../../hooks/useReports'
import { useAppStore } from '../../store/appStore'
import { reportNames } from '../../utils/reportMapper'
import { MatrixCell } from '../../types'
import CommentsList from './CommentsList'
import TasksList from './TasksList'
import AIAgentChat from '../ai/AIAgentChat'

interface LocationState {
  source?: 'dialog' | 'tasks'
  cell?: MatrixCell
}

export default function ReportViewer() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { openAIChatForReport, setSelectedCell, openTasksPanel } = useAppStore()
  const [activeTab, setActiveTab] = useState<'comments' | 'tasks'>('comments')
  
  const locationState = location.state as LocationState | null
  
  const comments = useReportComments(reportId || null)
  const tasks = useReportTasks(reportId || null)
  
  const isNewReport = reportId?.startsWith('NEW-')
  // Try different extensions for new reports
  const reportPath = isNewReport
    ? `/reports/new/${reportId}.jpg`
    : `/reports/current/${reportId}.png`
  
  const reportName = reportId ? (reportNames[reportId] || reportId) : ''
  
  const handleBackClick = () => {
    // Восстанавливаем модальное окно в зависимости от источника открытия
    if (locationState?.source === 'dialog' && locationState?.cell) {
      // Открываем ReportSelectionDialog с сохранённой ячейкой
      setSelectedCell(locationState.cell)
      navigate('/')
    } else if (locationState?.source === 'tasks') {
      // Открываем TasksPanel
      openTasksPanel()
      navigate('/')
    } else {
      // Если источник неизвестен, просто возвращаемся на главный экран
      navigate('/')
    }
  }
  
  const handleAIClick = () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/2c6270e7-c8fd-4efd-bf56-949c2db26996',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ReportViewer.tsx:handleAIClick',message:'AI button clicked for report',data:{reportId},timestamp:Date.now(),runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Открываем AI-чат для конкретного отчёта
    if (reportId) {
      openAIChatForReport(reportId)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-gray-900">
                {reportName}
              </h1>
              <span className="text-sm text-gray-500">{reportId}</span>
            </div>
            <button
              onClick={handleAIClick}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Bot className="w-4 h-4" />
              ИИ-агент
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-md p-6">
              <img
                src={reportPath}
                alt={reportId}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EОтчёт ' + reportId + '%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
          </div>
          
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'comments'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Комментарии ({comments.length})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'tasks'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      Задачи ({tasks.length})
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                {activeTab === 'comments' ? (
                  <CommentsList reportId={reportId || ''} />
                ) : (
                  <TasksList reportId={reportId || ''} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <AIAgentChat />
    </div>
  )
}