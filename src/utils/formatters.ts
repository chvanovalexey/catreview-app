export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value * 1_000_000)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Новая':
      return 'bg-blue-100 text-blue-800'
    case 'В работе':
      return 'bg-yellow-100 text-yellow-800'
    case 'Выполнена':
      return 'bg-green-100 text-green-800'
    case 'Просрочена':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getCellColor(percent: number): string {
  if (percent === 0) return 'bg-gray-50'
  if (percent <= 50) return 'bg-yellow-50'
  if (percent < 100) return 'bg-blue-50'
  return 'bg-pink-50'
}

/**
 * Returns badge styles based on the percentage of new reports
 * @param percent Percentage of new reports (0-100)
 * @returns Object with badge classes
 */
export function getBadgeStyle(percent: number): {
  bg: string
  text: string
  border: string
  pulse?: boolean
} {
  if (percent === 0) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200'
    }
  }
  if (percent <= 50) {
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200'
    }
  }
  if (percent < 100) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200'
    }
  }
  return {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    pulse: true
  }
}

/**
 * Returns progress bar color based on the percentage of new reports
 * @param percent Percentage of new reports (0-100)
 * @returns Tailwind gradient classes
 */
export function getProgressColor(percent: number): string {
  if (percent === 0) return 'from-gray-300 to-gray-400'
  if (percent <= 50) return 'from-amber-400 to-amber-500'
  if (percent < 100) return 'from-blue-400 to-blue-500'
  return 'from-emerald-400 to-emerald-500'
}

/** Градиент красный→зелёный для шкалы здоровья (0–100) */
export const HEALTH_GRADIENT = 'from-red-500 via-amber-400 to-emerald-500'