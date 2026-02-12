import type { Task } from '../types'

export interface InitiativeScore {
  score: number // Процент проработки (0-100)
  recommendations: string[] // Рекомендации по улучшению
  breakdown: {
    hasDescription: boolean
    hasSubtasks: boolean
    hasSkuDetails: boolean
    hasAllDates: boolean
    hasAssignee: boolean
    hasImpact: boolean
  }
}

/**
 * Оценивает степень проработки инициативы
 * 
 * Критерии оценки:
 * - Наличие описания (10%)
 * - Наличие подзадач (30%)
 * - Детализация по SKU (20%)
 * - Заполнены все даты (15%)
 * - Указан ответственный (10%)
 * - Заполнены метрики выручки/маржи (15%)
 */
export function calculateInitiativeDetailScore(task: Task, allTasks?: Task[]): InitiativeScore {
  const recommendations: string[] = []
  let totalScore = 0
  
  // 1. Наличие описания (10%)
  const hasDescription = !!(task.description && task.description.trim().length > 10)
  if (hasDescription) {
    totalScore += 10
  } else {
    recommendations.push('Добавьте подробное описание инициативы (минимум 10 символов)')
  }
  
  // 2. Наличие подзадач (30%)
  // Проверяем, есть ли дочерние задачи (с parent_id = task.id)
  const hasSubtasks = allTasks
    ? allTasks.some((t) => t.parent_id === task.id)
    : (task.parent_id !== undefined && task.parent_id !== null)
  if (hasSubtasks) {
    totalScore += 30
  } else {
    recommendations.push('Разбейте инициативу на подзадачи или этапы реализации (используйте кнопку "+")')
  }
  
  // 3. Детализация по SKU (20%)
  const hasSkuDetails = !!(task.sku_details && task.sku_details.trim().length > 5)
  if (hasSkuDetails) {
    totalScore += 20
  } else {
    recommendations.push('Добавьте детализацию по конкретным SKU или товарным группам')
  }
  
  // 4. Заполнены все даты (15%)
  const hasAllDates = !!(
    task.start_date && 
    task.impact_start_date && 
    task.impact_check_date
  )
  if (hasAllDates) {
    totalScore += 15
  } else {
    if (!task.start_date) recommendations.push('Укажите дату начала работы над инициативой')
    if (!task.impact_start_date) recommendations.push('Укажите дату начала проявления эффекта')
    if (!task.impact_check_date) recommendations.push('Укажите дату проверки достижения импакта')
  }
  
  // 5. Указан ответственный (10%)
  const hasAssignee = !!(task.assignee && task.assignee.trim().length > 0)
  if (hasAssignee) {
    totalScore += 10
  } else {
    recommendations.push('Назначьте ответственного за инициативу')
  }
  
  // 6. Заполнены метрики выручки/маржи (15%)
  const hasImpact = (
    task.revenue_impact_million > 0 || 
    task.margin_impact_million > 0
  )
  if (hasImpact) {
    totalScore += 15
  } else {
    recommendations.push('Заполните ожидаемый импакт на выручку или маржу')
  }
  
  return {
    score: totalScore,
    recommendations,
    breakdown: {
      hasDescription,
      hasSubtasks,
      hasSkuDetails,
      hasAllDates,
      hasAssignee,
      hasImpact
    }
  }
}

/**
 * Возвращает цвет бейджа в зависимости от процента проработки
 */
export function getScoreColorClass(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-300'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  return 'bg-red-100 text-red-800 border-red-300'
}

/**
 * Возвращает текстовую оценку
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Хорошо'
  if (score >= 50) return 'Средне'
  return 'Требует доработки'
}
