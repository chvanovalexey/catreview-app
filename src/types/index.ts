export interface ManagerComment {
  date: string
  author: string
  text: string
}

export interface Task {
  id: number
  description: string
  report_id: string
  status: 'Новая' | 'В работе' | 'Выполнена' | 'Просрочена'
  revenue_impact_million: number
  margin_impact_million: number
  due_date: string
  created_date: string
}

export interface ChatExample {
  question: string
  answer: string
}

export interface AIRecommendation {
  recommendation: string
  chat_examples: ChatExample[]
}

export interface Report {
  id: string
  title: string
  type: 'current' | 'new'
  description?: string
}

export interface MatrixCell {
  row: string
  column: string
  description: string
  reports: Report[]
  totalReports: number
  newReportsCount: number
  newReportsPercent: number
  aiRecommendationKey: string
}

export interface MatrixConfig {
  rows: string[]
  columns: string[]
  cells: MatrixCell[]
}

export type ManagerComments = Record<string, ManagerComment[]>
export type AIRecommendations = Record<string, AIRecommendation>