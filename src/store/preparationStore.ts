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

const STORAGE_KEY = 'catreview_preparation_state'

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

interface PersistedState {
  steps: PreparationStepState[]
  currentStepId: number
  startDate: string
  allInitiatives: Task[]
  nextInitiativeId: number
  initiativeStepMap: Record<number, number> // taskId -> stepId
}

function ensureStepStructure(step: PreparationStepState): PreparationStepState {
  const config = PREPARATION_STEPS.find((c) => c.id === step.id)
  if (!config?.columnKey || config.type !== 'analysis') return step

  const leverStates = { ...step.leverStates }
  const trafficLights = { ...step.trafficLights }
  const insights = { ...step.insights }

  for (const row of MATRIX_ROWS) {
    const cell = getMatrixCell(row, config.columnKey)
    if (cell) {
      if (leverStates[row] == null) leverStates[row] = 'not_viewed'
      if (trafficLights[row] === undefined) trafficLights[row] = null
      if (insights[row] == null) insights[row] = ''
    }
  }

  return {
    ...step,
    leverStates,
    trafficLights,
    insights,
  }
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed.steps || !Array.isArray(parsed.steps)) return null
    return {
      ...parsed,
      initiativeStepMap: parsed.initiativeStepMap ?? {},
      steps: parsed.steps.map(ensureStepStructure),
    }
  } catch {
    return null
  }
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

  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
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
  const persisted = loadPersisted()

  const initialSteps = persisted?.steps ?? createInitialSteps()
  const initialInitiatives = persisted?.allInitiatives ?? []
  const nextId =
    persisted?.nextInitiativeId ??
    Math.max(1000, ...initialInitiatives.map((t) => t.id), 0) + 1
  const initialStepMap = persisted?.initiativeStepMap ?? {}

  return {
    steps: initialSteps,
    currentStepId: persisted?.currentStepId ?? 1,
    startDate: persisted?.startDate ?? todayISO(),
    allInitiatives: initialInitiatives,
    nextInitiativeId: nextId,
    initiativeStepMap: initialStepMap,

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
      get().saveToLocalStorage()
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
      get().saveToLocalStorage()
    },

    setLeverTrafficLight: (stepId, lever, light) => {
      set((state) => {
        const steps = state.steps.map((s) => {
          if (s.id !== stepId) return s
          return { ...s, trafficLights: { ...s.trafficLights, [lever]: light } }
        })
        return { steps }
      })
      get().saveToLocalStorage()
    },

    setLeverInsights: (stepId, lever, insights) => {
      set((state) => {
        const steps = state.steps.map((s) => {
          if (s.id !== stepId) return s
          return { ...s, insights: { ...s.insights, [lever]: insights } }
        })
        return { steps }
      })
      get().saveToLocalStorage()
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
        due_date: taskInput.due_date,
        created_date: taskInput.created_date ?? created,
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
      get().saveToLocalStorage()
      return id
    },

    removeInitiative: (taskId) => {
      set((state) => {
        const allInitiatives = state.allInitiatives.filter((t) => t.id !== taskId)
        const { [taskId]: _, ...initiativeStepMap } = state.initiativeStepMap
        const steps = state.steps.map((s) => ({
          ...s,
          initiativesAdded: s.initiativesAdded.filter((id) => id !== taskId),
        }))
        const recalc = recalcStepTotals(steps, allInitiatives, initiativeStepMap)
        return { allInitiatives, initiativeStepMap, steps: recalc }
      })
      get().saveToLocalStorage()
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
      get().saveToLocalStorage()
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
      get().saveToLocalStorage()
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
      get().saveToLocalStorage()
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

      if (currentStepId === 4) return true
      if (currentStepId === 5) return true

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
      get().saveToLocalStorage()
    },

    saveToLocalStorage: () => {
      try {
        const state = get()
        const toSave: PersistedState = {
          steps: state.steps,
          currentStepId: state.currentStepId,
          startDate: state.startDate,
          allInitiatives: state.allInitiatives,
          nextInitiativeId: state.nextInitiativeId,
          initiativeStepMap: state.initiativeStepMap,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      } catch {
        // ignore
      }
    },

    loadFromLocalStorage: () => {
      const persisted = loadPersisted()
      if (persisted) {
        const initiativeStepMap = { ...(persisted.initiativeStepMap ?? {}) }
        const allInitiatives = persisted.allInitiatives
        const allOnStep1 = allInitiatives.length > 0 && allInitiatives.every((t) => initiativeStepMap[t.id] === 1)
        if (allOnStep1) {
          allInitiatives.forEach((t) => {
            const stepId = getStepIdForReportId(t.report_id)
            if (stepId) initiativeStepMap[t.id] = stepId
          })
        }
        const steps = recalcStepTotals(
          persisted.steps,
          allInitiatives,
          initiativeStepMap
        )
        set({
          steps,
          currentStepId: persisted.currentStepId,
          startDate: persisted.startDate,
          allInitiatives,
          nextInitiativeId: persisted.nextInitiativeId,
          initiativeStepMap,
        })
      }
    },

    seedFromTasks: (tasks) => {
      const state = get()
      if (state.allInitiatives.length > 0) return
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
      get().saveToLocalStorage()
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
