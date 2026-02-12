import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle, Circle, Loader2, ChevronRight } from 'lucide-react'
import { usePreparationStore } from '../../store/preparationStore'
import { PREPARATION_STEPS } from '../../types/preparation'
import { ImpactBadges } from './ImpactBadges'

export default function ProgressTracker() {
  const navigate = useNavigate()
  const { stepId } = useParams<{ stepId: string }>()
  const currentStepId = stepId ? parseInt(stepId, 10) : 1

  const {
    steps,
    canProceedToStep,
    getTotalRevenue,
    getTotalMargin,
    setCurrentStep,
  } = usePreparationStore()

  const handleStepClick = (id: number) => {
    if (!canProceedToStep(id) && id > currentStepId) return
    setCurrentStep(id)
    navigate(`/preparation/step/${id}`)
  }

  const { allInitiatives } = usePreparationStore()
  const totalRevenue = getTotalRevenue()
  const totalMargin = getTotalMargin()
  const totalInitiativeCount = allInitiatives.length

  return (
    <div className="w-full md:w-64 flex-shrink-0 border-r border-gray-200 bg-white p-4 flex flex-col md:border-b-0 border-b">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Прогресс</h3>

      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="text-xs text-gray-600 mb-2">
          Всего амбиций: <span className="font-semibold text-gray-900">{totalInitiativeCount}</span>
        </p>
        <ImpactBadges revenue={totalRevenue} margin={totalMargin} variant="compact" size="sm" />
      </div>

      {/* Узкие экраны: компактный ряд кнопок 1-2-3-4-5-6 */}
      <div className="flex md:hidden gap-1.5 flex-nowrap">
        {PREPARATION_STEPS.map((config) => {
          const isActive = config.id === currentStepId
          const isClickable = config.id <= currentStepId || canProceedToStep(config.id - 1)

          return (
            <button
              key={config.id}
              onClick={() => handleStepClick(config.id)}
              disabled={!isClickable && config.id > currentStepId}
              title={config.name}
              className={`flex items-center justify-center min-w-9 h-9 px-2 rounded-lg font-semibold text-sm transition-colors flex-shrink-0 ${
                isActive
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : isClickable
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    : 'bg-gray-50 text-gray-400 opacity-60 cursor-not-allowed'
              }`}
            >
              {config.id}
            </button>
          )
        })}
      </div>

      {/* Широкие экраны (md+): полная панель с названиями и бейджами */}
      <div className="hidden md:flex flex-col gap-2 overflow-visible flex-1">
        {PREPARATION_STEPS.map((config) => {
          const stepState = steps.find((s) => s.id === config.id)
          const isActive = config.id === currentStepId
          const isClickable = config.id <= currentStepId || canProceedToStep(config.id - 1)
          const revenue = stepState?.totalRevenueImpact ?? 0
          const margin = stepState?.totalMarginImpact ?? 0

          const StatusIcon = () => {
            if (stepState?.status === 'completed') {
              return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            }
            if (stepState?.status === 'skipped') {
              return <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
            }
            if (isActive) {
              return <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
            }
            return <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
          }

          return (
            <button
              key={config.id}
              onClick={() => handleStepClick(config.id)}
              disabled={!isClickable && config.id > currentStepId}
              className={`flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 border border-blue-200'
                  : isClickable
                    ? 'hover:bg-gray-50'
                    : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <StatusIcon />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-medium text-gray-900 break-words">{config.name}</p>
                  {(stepState?.initiativesAdded?.length ?? 0) > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-800 rounded whitespace-nowrap">
                      {stepState!.initiativesAdded.length} амб.
                    </span>
                  )}
                </div>
                {(revenue > 0 || margin > 0) && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    <ImpactBadges revenue={revenue} margin={margin} size="sm" />
                  </div>
                )}
              </div>
              {config.id < 6 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
