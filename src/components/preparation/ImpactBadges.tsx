/**
 * Бейджи Выручка/Маржа как на экране Здоровье (MatrixCell).
 * Используются единообразно по всему экрану Подготовка.
 */
interface ImpactBadgesProps {
  revenue: number
  margin: number
  /** Вариант отображения: compact (млн руб) или short (млн) */
  variant?: 'compact' | 'short'
  /** Размер: sm (как MatrixCell) или lg (для карточек) */
  size?: 'sm' | 'lg'
}

/** Стили как в MatrixCell на экране Здоровье */
const badgeClasses = {
  revenue: 'bg-emerald-50 text-emerald-800 rounded border border-emerald-200',
  margin: 'bg-blue-50 text-blue-800 rounded border border-blue-200',
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-3 py-1',
}

export function ImpactBadges({ revenue, margin, variant = 'short', size = 'sm' }: ImpactBadgesProps) {
  const suffix = variant === 'compact' ? 'млн руб' : 'млн'
  const sizeCls = sizeClasses[size]

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className={`inline-flex items-center ${sizeCls} ${badgeClasses.revenue} whitespace-nowrap`}>
        Выручка: +{revenue} {suffix}
      </span>
      <span className={`inline-flex items-center ${sizeCls} ${badgeClasses.margin} whitespace-nowrap`}>
        Маржа: +{margin} {suffix}
      </span>
    </div>
  )
}
