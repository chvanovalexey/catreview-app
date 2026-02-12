import { useParams, useNavigate } from 'react-router-dom'
import { FileText, Star, Sparkles } from 'lucide-react'
import { usePreparationStore } from '../../store/preparationStore'
import { useAppStore } from '../../store/appStore'
import { MATRIX_ROWS, getMatrixCell, reportNames } from '../../utils/reportMapper'
import type { MatrixCell, Report } from '../../types'
import LeverCard from './LeverCard'
import { ImpactBadges } from './ImpactBadges'
import InitiativesSummary from './InitiativesSummary'
import FinalSummary from './FinalSummary'
import UniversalReport from './UniversalReport'
import SkuRotationAI from './SkuRotationAI'

// --- E-com mock data ---
const ECOM_REPORT_IDS = ['NEW-REP-30', 'NEW-REP-31', 'NEW-REP-32', 'NEW-REP-33', 'NEW-REP-34'] as const
const ECOM_MANDATORY = new Set(['NEW-REP-30', 'NEW-REP-31'])

const ECOM_REPORTS: Report[] = ECOM_REPORT_IDS.map((rid) => ({
  id: rid,
  title: reportNames[rid] || rid,
  type: 'new',
  description: `Новый отчёт ${rid}`,
  isMandatory: ECOM_MANDATORY.has(rid),
}))

const ECOM_CELL: MatrixCell = {
  row: 'e-com',
  column: 'e-com',
  description: 'Доля e-com, динамика онлайн vs офлайн, модель потребления, ценообразование, уникальность ассортимента',
  questions: [
    'Какова доля e-com в продажах категории?',
    'Отличается ли ценообразование онлайн от офлайн?',
    'Есть ли уникальный ассортимент в e-com?',
  ],
  reports: ECOM_REPORTS,
  totalReports: ECOM_REPORTS.length,
  newReportsCount: ECOM_REPORTS.length,
  newReportsPercent: 100,
  aiRecommendationKey: 'e-com',
}

/** Мок-светофор для e-com: «yellow» — требует внимания */
const ECOM_TRAFFIC_LIGHT: 'red' | 'yellow' | 'green' = 'yellow'

export default function PreparationStep() {
  const { stepId } = useParams<{ stepId: string }>()
  const navigate = useNavigate()
  const id = stepId ? parseInt(stepId, 10) : 1

  const {
    getStepById,
    markLeverViewed,
    setLeverInsights,
    getInitiativesForStep,
    canProceedToStep,
    completeStep,
    setCurrentStep,
  } = usePreparationStore()

  const { openAIChat } = useAppStore()

  const step = getStepById(id)
  if (!step) return null

  if (id === 6) return <InitiativesSummary />
  if (id === 7) return <FinalSummary />

  const stepConfig = step.columnKey ? { columnKey: step.columnKey } : null
  const isAnalysisStep = id <= 3 && stepConfig
  const isEcomStep = id === 4
  const isDetailStep = id === 5

  const handleNext = () => {
    completeStep(id)
    setCurrentStep(id + 1)
    navigate(`/preparation/step/${id + 1}`)
  }

  const canNext = canProceedToStep(id + 1)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{step.name}</h2>
        <p className="text-gray-600 mt-1">{step.description}</p>
      </div>

      {isAnalysisStep && (
        <div className="grid sm:grid-cols-2 gap-6">
          {MATRIX_ROWS.map((lever) => {
            const cell = step.columnKey ? getMatrixCell(lever, step.columnKey) : null
            if (!cell) return null

            const initiatives = getInitiativesForStep(id).filter((t) =>
              cell.reports.some((r) => r.id === t.report_id)
            )
            const initiativeRevenue = initiatives.reduce((s, t) => s + t.revenue_impact_million, 0)
            const initiativeMargin = initiatives.reduce((s, t) => s + t.margin_impact_million, 0)

            return (
              <LeverCard
                key={lever}
                lever={lever}
                column={step.columnKey!}
                stepId={id}
                status={step.leverStates?.[lever] ?? 'not_viewed'}
                insights={step.insights?.[lever] ?? ''}
                initiativeCount={initiatives.length}
                initiativeRevenue={initiativeRevenue}
                initiativeMargin={initiativeMargin}
                onStatusChange={() => markLeverViewed(id, lever)}
                onInsightsChange={(text) => setLeverInsights(id, lever, text)}
              />
            )
          })}
        </div>
      )}

      {isEcomStep && (() => {
        const initiatives = getInitiativesForStep(id)
        const initiativeRevenue = initiatives.reduce((s, t) => s + t.revenue_impact_million, 0)
        const initiativeMargin = initiatives.reduce((s, t) => s + t.margin_impact_million, 0)
        const ecomStatus = step.leverStates?.['e-com'] ?? 'not_viewed'
        const trafficLight = ECOM_TRAFFIC_LIGHT

        const handleReportClick = (reportId: string) => {
          markLeverViewed(id, 'e-com')
          navigate(`/report/${reportId}`, {
            state: { source: 'preparation', stepId: id, returnTo: `/preparation/step/${id}` },
          })
        }

        const handleAIClick = () => {
          openAIChat(ECOM_CELL)
        }

        return (
          <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">e-com</h4>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {initiatives.length > 0 && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      {initiatives.length} амб.
                    </span>
                  )}
                  {(initiativeRevenue > 0 || initiativeMargin > 0) && (
                    <ImpactBadges revenue={initiativeRevenue} margin={initiativeMargin} size="sm" />
                  )}
                </div>
              </div>
              {ecomStatus !== 'not_viewed' && (
                <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded mt-1">
                  Просмотрено
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex flex-wrap gap-2">
                {ECOM_REPORTS.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => handleReportClick(report.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      report.isMandatory
                        ? 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 font-medium text-blue-900'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {report.isMandatory && <Star className="w-3 h-3 fill-blue-600 text-blue-600" />}
                    <FileText className={`w-4 h-4 ${report.isMandatory ? 'text-blue-600' : 'text-gray-500'}`} />
                    {report.title}
                  </button>
                ))}
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
                value={step.insights?.['e-com'] ?? ''}
                onChange={(e) => setLeverInsights(id, 'e-com', e.target.value)}
                placeholder="Заметки по e-commerce..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>
          </div>
          </div>
        )
      })()}

      {isDetailStep && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-gray-600 mb-4">
              Углубленный анализ проблемных зон. Зафиксируйте выводы и ссылки на отчёты.
            </p>
            <textarea
              placeholder="Заметки по детализации до SKU..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />
          </div>
          <SkuRotationAI />
          <UniversalReport />
        </div>
      )}

      {id < 7 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {id === 6 ? 'К финализации' : 'Далее'}
          </button>
        </div>
      )}
    </div>
  )
}
