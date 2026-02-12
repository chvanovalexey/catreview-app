import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Sparkles, MessageSquare, CheckSquare, Info, Plus } from 'lucide-react'
import { useReportComments, useReportTasks } from '../../hooks/useReports'
import { HEALTH_GRADIENT } from '../../utils/formatters'
import reportHealth from '../../data/report_health.json'
import { useAppStore } from '../../store/appStore'
import { reportNames } from '../../utils/reportMapper'
import { MatrixCell } from '../../types'
import CommentsList from './CommentsList'
import TasksList from './TasksList'
import AIAgentChat from '../ai/AIAgentChat'
import InitiativeForm from '../preparation/InitiativeForm'
import { usePreparationStore } from '../../store/preparationStore'

interface LocationState {
  source?: 'dialog' | 'tasks' | 'preparation'
  cell?: MatrixCell
  stepId?: number
  returnTo?: string
}

export default function ReportViewer() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { openAIChatForReport, setSelectedCell, openTasksPanel } = useAppStore()
  const { addInitiative, currentStepId } = usePreparationStore()
  const [activeTab, setActiveTab] = useState<'comments' | 'tasks'>('comments')
  const [showInitiativeForm, setShowInitiativeForm] = useState(false)
  
  const locationState = location.state as LocationState | null
  
  const comments = useReportComments(reportId || null)
  const tasks = useReportTasks(reportId || null)
  const totalRevenueImpact = tasks.reduce((sum, t) => sum + (t.revenue_impact_million || 0), 0)
  const totalMarginImpact = tasks.reduce((sum, t) => sum + (t.margin_impact_million || 0), 0)
  
  const isNewReport = reportId?.startsWith('NEW-')
  // Try different extensions for new reports
  const reportPath = isNewReport
    ? `/reports/new/${reportId}.jpg`
    : `/reports/current/${reportId}.png`
  
  const reportName = reportId ? (reportNames[reportId] || reportId) : ''
  const reportHealthMap = reportHealth as Record<string, number>
  const healthPercent = reportId ? (reportHealthMap[reportId] ?? 50) : 50
  
  const handleBackClick = () => {
    if (locationState?.source === 'preparation' && locationState?.returnTo) {
      navigate(locationState.returnTo)
    } else if (locationState?.source === 'dialog' && locationState?.cell) {
      setSelectedCell(locationState.cell)
      navigate('/matrix')
    } else if (locationState?.source === 'tasks') {
      openTasksPanel()
      navigate('/')
    } else {
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
            {(totalRevenueImpact > 0 || totalMarginImpact > 0) && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-100 rounded-lg">
                <span className="text-sm">
                  <span className="text-gray-500">Выручка:</span>{' '}
                  <strong className="text-green-600">+{totalRevenueImpact} млн ₽</strong>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm">
                  <span className="text-gray-500">Маржа:</span>{' '}
                  <strong className="text-blue-600">+{totalMarginImpact} млн ₽</strong>
                </span>
              </div>
            )}
            <button
              onClick={handleAIClick}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              ИИ-агент
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Прогресс-бар здоровья отчёта (оценивает ИИ-агент). Градиент красный→зелёный на всю длину; при 50% — красный→жёлтый */}
              <div className="mb-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full overflow-hidden" style={{ width: `${healthPercent}%` }}>
                    <div
                      className={`h-full bg-gradient-to-r ${HEALTH_GRADIENT} transition-all duration-500`}
                      style={{ width: healthPercent > 0 ? `${100 / healthPercent * 100}%` : 0 }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-10">{healthPercent}%</span>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
                  <div className="absolute left-0 top-full mt-1 px-2 py-1.5 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10 w-48">
                    Здоровье отчёта автоматически оценивает ИИ-агент на основе анализа данных
                  </div>
                </div>
              </div>
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
                <div className="flex items-center">
                  <div className="flex flex-1">
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
                        Амбиции ({tasks.length})
                      </div>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowInitiativeForm(true)}
                    className="flex items-center gap-2 px-4 py-2 mx-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить амбицию
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
      
      {showInitiativeForm && reportId && (
        <InitiativeForm
          initialData={{
            report_id: reportId,
            description: '',
            status: 'Новая',
            revenue_impact_million: 0,
            margin_impact_million: 0,
            start_date: new Date().toISOString().split('T')[0],
            created_date: new Date().toISOString().split('T')[0],
          }}
          onSave={(taskData) => {
            const stepId = locationState?.stepId ?? currentStepId ?? 1
            addInitiative(stepId, taskData)
          }}
          onClose={() => setShowInitiativeForm(false)}
        />
      )}
      
      <AIAgentChat />
    </div>
  )
}