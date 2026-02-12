import { create } from 'zustand'
import type { Task } from '../types'
import type {
  PreparationStepConfig,
  PreparationStepState,
  StepStatus,
  LeverStatus,
  TrafficLight,
} from '../types/preparation'
import { PREPARATION_STEPS } from '../types/preparation'
import { MATRIX_ROWS } from '../utils/reportMapper'
import { getMatrixCell, getStepIdForReportId } from '../utils/reportMapper'

function getDefaultStepState(config: PreparationStepConfig): PreparationStepState {
  const leverStates: Record<string, LeverStatus> = {}
  const trafficLights: Record<string, TrafficLight> = {}
  const insights: Record<string, string> = {}

  if (config.columnKey && config.type === 'analysis') {
    for (const row of MATRIX_ROWS) {
      const cell = getMatrixCell(row, config.columnKey)
      if (cell) {
        leverStates[row] = 'not_viewed'
        trafficLights[row] = null
        insights[row] = ''
      }
    }
  }

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    columnKey: config.columnKey,
    status: config.id === 1 ? 'in_progress' : 'not_started',
    leversAnalyzed: [],
    initiativesAdded: [],
    totalRevenueImpact: 0,
    totalMarginImpact: 0,
    leverStates,
    trafficLights,
    insights,
  }
}

function createInitialSteps(): PreparationStepState[] {
  return PREPARATION_STEPS.map((config) => getDefaultStepState(config))
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

interface PreparationState {
  steps: PreparationStepState[]
  currentStepId: number
  startDate: string
  allInitiatives: Task[]
  nextInitiativeId: number
  initiativeStepMap: Record<number, number>

  setCurrentStep: (id: number) => void
  markLeverViewed: (stepId: number, lever: string) => void
  setLeverTrafficLight: (stepId: number, lever: string, light: TrafficLight) => void
  setLeverInsights: (stepId: number, lever: string, insights: string) => void
  addInitiative: (stepId: number, task: Omit<Task, 'id'> & { id?: number }) => number
  removeInitiative: (taskId: number) => void
  updateInitiative: (taskId: number, updates: Partial<Task> & { stepId?: number }) => void
  setInitiativeStep: (taskId: number, stepId: number) => void
  completeStep: (stepId: number) => void
  skipStep: (stepId: number) => void
  canProceedToStep: (stepId: number) => boolean
  resetPreparation: () => void

  seedFromTasks: (tasks: Task[]) => void
  getStepById: (id: number) => PreparationStepState | undefined
  getInitiativesForStep: (stepId: number) => Task[]
  getTotalRevenue: () => number
  getTotalMargin: () => number
}

function recalcStepTotals(
  steps: PreparationStepState[],
  allInitiatives: Task[],
  initiativeStepMap: Record<number, number>
): PreparationStepState[] {
  return steps.map((step) => {
    const stepInitiativeIds = allInitiatives
      .filter((t) => initiativeStepMap[t.id] === step.id)
      .map((t) => t.id)
    const totalRevenue = allInitiatives
      .filter((t) => stepInitiativeIds.includes(t.id))
      .reduce((s, t) => s + t.revenue_impact_million, 0)
    const totalMargin = allInitiatives
      .filter((t) => stepInitiativeIds.includes(t.id))
      .reduce((s, t) => s + t.margin_impact_million, 0)
    return {
      ...step,
      initiativesAdded: stepInitiativeIds,
      totalRevenueImpact: totalRevenue,
      totalMarginImpact: totalMargin,
    }
  })
}

export const usePreparationStore = create<PreparationState>((set, get) => {
  return {
    steps: createInitialSteps(),
    currentStepId: 1,
    startDate: todayISO(),
    allInitiatives: [],
    nextInitiativeId: 1000,
    initiativeStepMap: {},

    setCurrentStep: (id) => {
      set((state) => {
        const steps = state.steps.map((s) =>
          s.id === state.currentStepId && s.status === 'in_progress'
            ? { ...s, status: 'completed' as StepStatus }
            : s.id === id
              ? { ...s, status: 'in_progress' as StepStatus }
              : s
        )
        return { currentStepId: id, steps }
      })
    },

    markLeverViewed: (stepId, lever) => {
      set((state) => {
        const steps = state.steps.map((s) => {
          if (s.id !== stepId) return s
          const leverStates = { ...s.leverStates, [lever]: 'viewed' as LeverStatus }
          return {
            ...s,
            leverStates,
            leversAnalyzed: [...new Set([...s.leversAnalyzed, lever])],
          }
        })
        return { steps }
      })
    },

    setLeverTrafficLight: (stepId, lever, light) => {
      set((state) => {
        const steps = state.steps.map((s) => {
          if (s.id !== stepId) return s
          return { ...s, trafficLights: { ...s.trafficLights, [lever]: light } }
        })
        return { steps }
      })
    },

    setLeverInsights: (stepId, lever, insights) => {
      set((state) => {
        const steps = state.steps.map((s) => {
          if (s.id !== stepId) return s
          return { ...s, insights: { ...s.insights, [lever]: insights } }
        })
        return { steps }
      })
    },

    addInitiative: (stepId, taskInput) => {
      const id = taskInput.id ?? get().nextInitiativeId
      const created = new Date().toISOString().split('T')[0]
      const task: Task = {
        id,
        description: taskInput.description,
        report_id: taskInput.report_id,
        status: taskInput.status,
        revenue_impact_million: taskInput.revenue_impact_million,
        margin_impact_million: taskInput.margin_impact_million,
        created_date: taskInput.created_date ?? created,
        start_date: taskInput.start_date,
        impact_start_date: taskInput.impact_start_date,
        impact_check_date: taskInput.impact_check_date,
        assignee: taskInput.assignee,
        parent_id: taskInput.parent_id,
        sku_details: taskInput.sku_details,
      }

      set((state) => {
        const nextInitiativeId = taskInput.id ? state.nextInitiativeId : state.nextInitiativeId + 1
        const allInitiatives = [...state.allInitiatives, task]
        const initiativeStepMap = { ...state.initiativeStepMap, [task.id]: stepId }

        const steps = recalcStepTotals(
          state.steps.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  initiativesAdded: [...s.initiativesAdded, task.id],
                }
              : s
          ),
          allInitiatives,
          initiativeStepMap
        )
        return {
          allInitiatives,
          nextInitiativeId,
          initiativeStepMap,
          steps,
        }
      })
      return id
    },

    removeInitiative: (taskId) => {
      set((state) => {
        // Cascade: also remove child tasks (subtasks)
        const childIds = state.allInitiatives
          .filter((t) => t.parent_id === taskId)
          .map((t) => t.id)
        const idsToRemove = new Set([taskId, ...childIds])

        const allInitiatives = state.allInitiatives.filter((t) => !idsToRemove.has(t.id))
        const initiativeStepMap = { ...state.initiativeStepMap }
        idsToRemove.forEach((id) => delete initiativeStepMap[id])
        const steps = state.steps.map((s) => ({
          ...s,
          initiativesAdded: s.initiativesAdded.filter((id) => !idsToRemove.has(id)),
        }))
        const recalc = recalcStepTotals(steps, allInitiatives, initiativeStepMap)
        return { allInitiatives, initiativeStepMap, steps: recalc }
      })
    },

    updateInitiative: (taskId, updates) => {
      set((state) => {
        const { stepId, ...taskUpdates } = updates as Partial<Task> & { stepId?: number }
        const allInitiatives = state.allInitiatives.map((t) =>
          t.id === taskId ? { ...t, ...taskUpdates } : t
        )
        const initiativeStepMap =
          stepId != null
            ? { ...state.initiativeStepMap, [taskId]: stepId }
            : state.initiativeStepMap
        const steps = recalcStepTotals(state.steps, allInitiatives, initiativeStepMap)
        return { allInitiatives, initiativeStepMap, steps }
      })
    },

    setInitiativeStep: (taskId, stepId) => {
      get().updateInitiative(taskId, { stepId })
    },

    completeStep: (stepId) => {
      set((state) => {
        const steps = state.steps.map((s) =>
          s.id === stepId
            ? {
                ...s,
                status: 'completed' as StepStatus,
                completionDate: todayISO(),
              }
            : s
        )
        return { steps }
      })
    },

    skipStep: (stepId) => {
      set((state) => {
        const steps = state.steps.map((s) =>
          s.id === stepId
            ? {
                ...s,
                status: 'skipped' as StepStatus,
                completionDate: todayISO(),
              }
            : s
        )
        return { steps }
      })
    },

    canProceedToStep: (stepId) => {
      const { steps, currentStepId, initiativeStepMap, allInitiatives } = get()
      if (stepId <= currentStepId) return true
      if (stepId > currentStepId + 1) return false

      const current = steps.find((s) => s.id === currentStepId)
      if (!current) return true

      const initiativesOnCurrentStep = allInitiatives.filter(
        (t) => initiativeStepMap[t.id] === currentStepId
      )
      const hasInitiatives = initiativesOnCurrentStep.length > 0

      if (currentStepId <= 3) {
        const stepConfig = PREPARATION_STEPS.find((c) => c.id === currentStepId)
        if (stepConfig?.columnKey) {
          const levers = Object.keys(current.leverStates ?? {})
          if (levers.length === 0) return true
          const allViewed = levers.every(
            (l) => (current.leverStates?.[l] ?? 'not_viewed') !== 'not_viewed'
          )
          return allViewed || hasInitiatives
        }
      }

      if (currentStepId === 4) return true // e-com
      if (currentStepId === 5) return true // Детализация до SKU
      if (currentStepId === 6) return true // Амбиции и приоритизация

      return true
    },

    resetPreparation: () => {
      set({
        steps: createInitialSteps(),
        currentStepId: 1,
        startDate: todayISO(),
        allInitiatives: [],
        nextInitiativeId: 1000,
        initiativeStepMap: {},
      })
    },

    seedFromTasks: (tasks) => {
      const state = get()

      if (state.allInitiatives.length > 0) {
        // Уже есть инициативы — обновляем недостающие поля из tasks.json
        const seedMap = new Map(tasks.map((t) => [t.id, t]))
        const existingIds = new Set(state.allInitiatives.map((t) => t.id))
        let updated = false
        const allInitiatives = state.allInitiatives.map((existing) => {
          const seed = seedMap.get(existing.id)
          if (!seed) return existing
          // Если у сохранённой инициативы нет новых полей — подтягиваем из tasks.json
          const needsUpdate =
            !existing.assignee ||
            !existing.start_date ||
            !existing.impact_start_date ||
            !existing.impact_check_date
          if (needsUpdate) {
            updated = true
            return {
              ...existing,
              assignee: existing.assignee || seed.assignee,
              start_date: existing.start_date || seed.start_date,
              impact_start_date: existing.impact_start_date || seed.impact_start_date,
              impact_check_date: existing.impact_check_date || seed.impact_check_date,
              sku_details: existing.sku_details || seed.sku_details,
            }
          }
          return existing
        })

        // Add any new tasks from tasks.json that are missing (e.g. subtasks)
        const newTasks = tasks.filter((t) => !existingIds.has(t.id))
        const newInitiativeStepMap = { ...state.initiativeStepMap }
        if (newTasks.length > 0) {
          updated = true
          newTasks.forEach((t) => {
            allInitiatives.push(t)
            const stepId = getStepIdForReportId(t.report_id)
            newInitiativeStepMap[t.id] = stepId ?? 1
          })
        }

        if (updated) {
          const steps = recalcStepTotals(state.steps, allInitiatives, newInitiativeStepMap)
          set({
            allInitiatives,
            initiativeStepMap: newInitiativeStepMap,
            steps,
            nextInitiativeId: Math.max(state.nextInitiativeId, ...allInitiatives.map((t) => t.id), 0) + 1,
          })
        }
        return
      }

      const initiativeStepMap: Record<number, number> = {}
      tasks.forEach((t) => {
        const stepId = getStepIdForReportId(t.report_id)
        initiativeStepMap[t.id] = stepId ?? 1
      })
      const allInitiatives = [...tasks]
      const steps = recalcStepTotals(state.steps, allInitiatives, initiativeStepMap)
      set({
        allInitiatives,
        initiativeStepMap: { ...state.initiativeStepMap, ...initiativeStepMap },
        nextInitiativeId: Math.max(1000, ...tasks.map((t) => t.id), 0) + 1,
        steps,
      })
    },

    getStepById: (id) => get().steps.find((s) => s.id === id),

    getInitiativesForStep: (stepId) => {
      const { allInitiatives, initiativeStepMap } = get()
      return allInitiatives.filter((t) => initiativeStepMap[t.id] === stepId)
    },

    getTotalRevenue: () =>
      get().allInitiatives.reduce((s, t) => s + t.revenue_impact_million, 0),

    getTotalMargin: () =>
      get().allInitiatives.reduce((s, t) => s + t.margin_impact_million, 0),
  }
})
