import type { Task, Report } from './index'
import { MATRIX_COLUMNS } from '../utils/reportMapper'

export type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped'
export type LeverStatus = 'not_viewed' | 'viewed' | 'analyzed'
export type TrafficLight = 'red' | 'yellow' | 'green' | null

export interface PreparationStepConfig {
  id: number
  name: string
  description: string
  columnKey?: string // For steps 1-3: reference to matrix column
  type: 'analysis' | 'initiatives' | 'summary'
}

export interface LeverAnalysis {
  lever: string
  column: string
  reports: Report[]
  status: LeverStatus
  trafficLight: TrafficLight
  insights: string
  stepId: number
}

export interface PreparationStepState {
  id: number
  name: string
  description: string
  columnKey?: string
  status: StepStatus
  leversAnalyzed: string[]
  initiativesAdded: number[]
  totalRevenueImpact: number
  totalMarginImpact: number
  completionDate?: string
  leverStates: Record<string, LeverStatus>
  trafficLights: Record<string, TrafficLight>
  insights: Record<string, string>
}

export interface Initiative extends Task {
  priority?: number
  lever?: string
  stepId?: number
}

export const PREPARATION_STEPS: PreparationStepConfig[] = [
  {
    id: 1,
    name: MATRIX_COLUMNS[0],
    description: 'Анализ здоровья категории по всем рычагам',
    columnKey: MATRIX_COLUMNS[0],
    type: 'analysis',
  },
  {
    id: 2,
    name: MATRIX_COLUMNS[1],
    description: 'Потребности и структура по всем рычагам',
    columnKey: MATRIX_COLUMNS[1],
    type: 'analysis',
  },
  {
    id: 3,
    name: MATRIX_COLUMNS[2],
    description: 'Разрывы с рынком по всем рычагам',
    columnKey: MATRIX_COLUMNS[2],
    type: 'analysis',
  },
  {
    id: 4,
    name: 'Детализация до SKU',
    description: 'Углубленный анализ проблемных зон',
    type: 'analysis',
  },
  {
    id: 5,
    name: 'Инициативы и приоритизация',
    description: 'Просмотр, корректировка и приоритизация инициатив',
    type: 'initiatives',
  },
  {
    id: 6,
    name: 'Финализация',
    description: 'Итоговый summary с экспортом',
    type: 'summary',
  },
]
