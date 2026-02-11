import { useParams, useNavigate } from 'react-router-dom'
import { usePreparationStore } from '../../store/preparationStore'
import { MATRIX_ROWS, getMatrixCell } from '../../utils/reportMapper'
import LeverCard from './LeverCard'
import InitiativesSummary from './InitiativesSummary'
import FinalSummary from './FinalSummary'
import UniversalReport from './UniversalReport'

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

  const step = getStepById(id)
  if (!step) return null

  if (id === 5) return <InitiativesSummary />
  if (id === 6) return <FinalSummary />

  const stepConfig = step.columnKey ? { columnKey: step.columnKey } : null
  const isAnalysisStep = id <= 3 && stepConfig
  const isDetailStep = id === 4

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
          <UniversalReport />
        </div>
      )}

      {id < 6 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {id === 5 ? 'К финализации' : 'Далее'}
          </button>
        </div>
      )}
    </div>
  )
}
