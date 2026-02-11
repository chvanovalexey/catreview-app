import type { TrafficLight } from '../types/preparation'
import { getMatrixCell } from './reportMapper'

/**
 * Computes traffic light from cell.newReportsPercent (доля новых отчётов),
 * как в прогресс-баре карточек MatrixCell на экране Здоровье.
 * 0-100%: red < 50, yellow 50-74, green >= 75.
 */
export function getTrafficLightForLever(lever: string, column: string): TrafficLight {
  const cell = getMatrixCell(lever, column)
  if (!cell || cell.reports.length === 0) return null

  const percent = cell.newReportsPercent
  if (percent < 50) return 'red'
  if (percent < 75) return 'yellow'
  return 'green'
}
