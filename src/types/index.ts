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
  created_date: string
  // Поля жизненного цикла инициативы
  start_date: string // Дата начала работы над инициативой
  impact_start_date?: string // Дата начала проявления эффекта
  impact_check_date?: string // Дата проверки достижения импакта
  // Ответственный (ФИО или отдел)
  assignee?: string
  // Иерархия инициатив
  parent_id?: number // Ссылка на родительскую инициативу
  sku_details?: string // Детализация по SKU
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
  isMandatory?: boolean // Обязательный отчёт для просмотра
}

export interface MatrixCell {
  row: string
  column: string
  description: string
  questions: string[]
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