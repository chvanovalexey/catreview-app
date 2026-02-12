import { MatrixCell, Report } from '../types'

// New matrix structure: Levers (rows) × Super-logic stages (columns)
export const MATRIX_ROWS = ['Ассортимент', 'Цена и Промо', 'Полка (Merch)', 'Бренды и Поставщики'] as const
export const MATRIX_COLUMNS = [
  '1. Здоровье и Эффективность (Internal)',
  '2. Потребности и Структура (Shopper)',
  '3. Разрывы с Рынком (External)'
] as const

// Mapping of report codes to their names from report-list.txt
export const reportNames: Record<string, string> = {
  // Current reports (AS-IS)
  'REP-01': 'Ключевые показатели',
  'REP-02': 'Ключевые показатели по кварталам',
  'REP-03': 'Ключевые показатели в разрезе подгрупп',
  'REP-04': 'Чековая аналитика',
  'REP-05': 'Продажи LFL по ценовым сегментам',
  'REP-06': 'Аналитика по фасетам (сравнение с КиБ, БРЛ, Пят)',
  'REP-08': 'Доля Дикси на рынке',
  'REP-09': 'Динамика продаж (руб.) подгрупп Дикси vs Рынок без Дикси',
  'REP-10': 'Динамика доли подгрупп Дикси на Рынке по оценке Nielsen',
  'REP-11': 'Структура продаж Дикси vs Рынок без Дикси',
  'REP-12': 'Топ-20 производителей (Рынок vs Дикси)',
  'REP-13': 'Топ SKU Рынка (Nielsen)',
  'REP-14': 'Динамика показателей: LFL, пенетрация, доля e-com',
  'REP-15': 'EDLP, EDPP динамика (ищут ли первую цену)',
  'REP-16': 'Обзор показателей основного промо',
  'REP-17': 'Товарные запасы и потери',
  'REP-18': 'Аналитика СТМ',
  'REP-19': 'Топ SKU Магнита (эксклюзивы конкурента)',
  'REP-20': 'Ценовые лестницы (сравнение диапазонов)',
  
  // New reports (TO-BE)
  'NEW-REP-01': 'CDT (Customer Decision Tree)',
  'NEW-REP-02': 'Спектр чека',
  'NEW-REP-03': 'Миссии',
  'NEW-REP-04': 'Price Perception Index (PPI)',
  'NEW-REP-05': 'KVI Index',
  'NEW-REP-06': 'Айтрекинг / Heatmap',
  'NEW-REP-07': 'Планограмма глазами покупателя',
  'NEW-REP-08': 'NPS Категории',
  'NEW-REP-09': 'CSI (Customer Satisfaction Index)',
  'NEW-REP-10': 'Brand Health Tracking',
  'NEW-REP-11': 'Тренды новинок (Innovation Report)',
  'NEW-REP-12': 'Индекс HHI по поставщикам',
  'NEW-REP-13': 'Матрица уникальности',
  'NEW-REP-14': 'Ценовой индекс (PI)',
  'NEW-REP-15': 'Доля промо у конкурентов',
  'NEW-REP-16': 'SOS (Share of Shelf)',
  'NEW-REP-17': 'OSA Benchmark',
  'NEW-REP-18': 'Бренды у конкурентов',
  'NEW-REP-19': 'ABC/XYZ анализ',
  'NEW-REP-20': '«Хвост» и Новинки',
  'NEW-REP-21': 'Waterfall P&L',
  'NEW-REP-22': 'Пост-анализ промо',
  'NEW-REP-23': 'Эффективность планограммы',
  'NEW-REP-24': 'OSA (On Shelf Availability)',
  'NEW-REP-25': 'Back Margin Report',
  'NEW-REP-26': 'Service Level',
  
  // СТМ reports
  'NEW-REP-27': 'СТМ: Доля и динамика',
  'NEW-REP-28': 'СТМ: Ценообразование vs бренды',
  'NEW-REP-29': 'СТМ: Сравнение с конкурентами',
  
  // E-commerce reports
  'NEW-REP-30': 'Доля e-com в продажах категории',
  'NEW-REP-31': 'Динамика онлайн vs офлайн',
  'NEW-REP-32': 'Модель потребления в e-com',
  'NEW-REP-33': 'Ценообразование в e-com vs офлайн',
  'NEW-REP-34': 'Ассортимент e-com: уникальность и пересечения',
}

const COL = MATRIX_COLUMNS

// Отчёты с данными Дикси + Магнит (сравнение Дикси vs Магнит)
const REPORTS_WITH_MAGNIT = ['REP-01', 'REP-02', 'REP-03', 'REP-12', 'REP-14', 'REP-19', 'REP-20']
// Отчёты с данными Дикси + Nielsen (сравнение Дикси vs рынок)
const REPORTS_WITH_NIELSEN = ['REP-08', 'REP-09', 'REP-10', 'REP-11', 'REP-12', 'REP-13']

// Первые вопросы про сравнение: cellKey -> { magnit?: string, nielsen?: string }
const comparisonQuestions: Record<string, { magnit?: string; nielsen?: string }> = {
  [`Ассортимент_${COL[0]}`]: {
    magnit: 'Дикси vs Магнит: выручка, рост, доля'
  },
  [`Ассортимент_${COL[1]}`]: {
    magnit: 'Дикси vs Магнит: LFL, пенетрация, e-com'
  },
  [`Ассортимент_${COL[2]}`]: {
    magnit: 'Дикси vs Магнит: топ-SKU, эксклюзивы',
    nielsen: 'Дикси vs Nielsen: доля, динамика подгрупп'
  },
  [`Цена и Промо_${COL[2]}`]: {
    magnit: 'Дикси vs Магнит: ценовые лестницы, динамика'
  },
  [`Бренды и Поставщики_${COL[0]}`]: {
    magnit: 'Дикси vs Магнит: топ-20 производителей',
    nielsen: 'Дикси vs Nielsen: топ-20 производителей'
  },
  [`Бренды и Поставщики_${COL[2]}`]: {
    magnit: 'Дикси vs Магнит: топ-20 производителей',
    nielsen: 'Дикси vs Nielsen: топ-20 производителей'
  }
}

// Mapping: Lever × Super-logic → reports
const reportMapping: Record<string, { current: string[], new: string[] }> = {
  // === Ассортимент (Ядро категории) ===
  [`Ассортимент_${COL[0]}`]: {
    current: ['REP-01', 'REP-02', 'REP-03'],
    new: ['NEW-REP-19', 'NEW-REP-20', 'NEW-REP-21', 'NEW-REP-27']
  },
  [`Ассортимент_${COL[1]}`]: {
    current: ['REP-04', 'REP-14'],
    new: ['NEW-REP-01', 'NEW-REP-02', 'NEW-REP-03']
  },
  [`Ассортимент_${COL[2]}`]: {
    current: ['REP-08', 'REP-09', 'REP-10', 'REP-11', 'REP-13', 'REP-06', 'REP-19'],
    new: ['NEW-REP-11', 'NEW-REP-13', 'NEW-REP-29']
  },

  // === Цена и Промо (Восприятие ценности) ===
  [`Цена и Промо_${COL[0]}`]: {
    current: ['REP-16', 'REP-15'],
    new: ['NEW-REP-22']
  },
  [`Цена и Промо_${COL[1]}`]: {
    current: ['REP-04'],
    new: ['NEW-REP-04', 'NEW-REP-05', 'NEW-REP-28']
  },
  [`Цена и Промо_${COL[2]}`]: {
    current: ['REP-05', 'REP-20'],
    new: ['NEW-REP-14', 'NEW-REP-15', 'NEW-REP-29']
  },

  // === Полка (Merch) — Выкладка + OSA ===
  [`Полка (Merch)_${COL[0]}`]: {
    current: ['REP-17'],
    new: ['NEW-REP-23', 'NEW-REP-24']
  },
  [`Полка (Merch)_${COL[1]}`]: {
    current: [],
    new: ['NEW-REP-06', 'NEW-REP-07', 'NEW-REP-08', 'NEW-REP-09']
  },
  [`Полка (Merch)_${COL[2]}`]: {
    current: [],
    new: ['NEW-REP-16', 'NEW-REP-17', 'NEW-REP-29']
  },

  // === Бренды и Поставщики (Закупка) ===
  [`Бренды и Поставщики_${COL[0]}`]: {
    current: ['REP-12', 'REP-18'],
    new: ['NEW-REP-25', 'NEW-REP-26', 'NEW-REP-27']
  },
  [`Бренды и Поставщики_${COL[1]}`]: {
    current: [],
    new: ['NEW-REP-10']
  },
  [`Бренды и Поставщики_${COL[2]}`]: {
    current: ['REP-12'],
    new: ['NEW-REP-12', 'NEW-REP-18', 'NEW-REP-29']
  }
}

// Обязательные отчёты (Must Have) для каждой ячейки матрицы
// 2-3 ключевых отчёта, которые нужно обязательно просмотреть
const mandatoryReports: Record<string, string[]> = {
  [`Ассортимент_${COL[0]}`]: ['REP-01', 'REP-02', 'NEW-REP-19'],
  [`Ассортимент_${COL[1]}`]: ['REP-04', 'NEW-REP-01', 'NEW-REP-03'],
  [`Ассортимент_${COL[2]}`]: ['REP-08', 'REP-13', 'REP-19'],
  
  [`Цена и Промо_${COL[0]}`]: ['REP-16', 'NEW-REP-22'],
  [`Цена и Промо_${COL[1]}`]: ['NEW-REP-04', 'NEW-REP-05'],
  [`Цена и Промо_${COL[2]}`]: ['REP-20', 'NEW-REP-14'],
  
  [`Полка (Merch)_${COL[0]}`]: ['REP-17', 'NEW-REP-23'],
  [`Полка (Merch)_${COL[1]}`]: ['NEW-REP-06', 'NEW-REP-08'],
  [`Полка (Merch)_${COL[2]}`]: ['NEW-REP-16', 'NEW-REP-17'],
  
  [`Бренды и Поставщики_${COL[0]}`]: ['REP-12', 'REP-18'],
  [`Бренды и Поставщики_${COL[1]}`]: ['NEW-REP-10'],
  [`Бренды и Поставщики_${COL[2]}`]: ['REP-12', 'NEW-REP-12'],
}

// Вопросы, на которые категорийный менеджер может ответить с помощью отчётов в ячейке
const cellQuestions: Record<string, string[]> = {
  [`Ассортимент_${COL[0]}`]: [
    'Рост/падение? Роль категории?',
    'Доля «хвоста» ассортимента?',
    'Структура P&L (Gross → Net)?'
  ],
  [`Ассортимент_${COL[1]}`]: [
    'CDT-покрытие? Ценовая лестница?',
    'Миссии покупки в категории?',
    'Переключение между SKU?'
  ],
  [`Ассортимент_${COL[2]}`]: [
    'Что есть у конкурентов, чего нет у нас?',
    'Топ-SKU рынка отсутствуют?',
    'Доля уникального ассортимента vs конкуренты?'
  ],

  [`Цена и Промо_${COL[0]}`]: [
    'Рост/падение? Эффективность промо (Uplift/ROI)?',
    'Каннибализация промо?',
    'Эффект от EDLP?'
  ],
  [`Цена и Промо_${COL[1]}`]: [
    'Восприятие цен (PPI)?',
    'Ценовая лестница? KVI-товары?',
    'Эластичность по сегментам?'
  ],
  [`Цена и Промо_${COL[2]}`]: [
    'Где дороже? (PI)',
    'Доля промо у конкурентов?',
    'Ценовые лестницы vs рынок?'
  ],

  [`Полка (Merch)_${COL[0]}`]: [
    'Продажи/маржа на п.м?',
    'OSA: доступность на полке?',
    'Потери и запасы?'
  ],
  [`Полка (Merch)_${COL[1]}`]: [
    'Планограмма понятна? (Айтрекинг)',
    'Выкладка = CDT?',
    'NPS, CSI категории?'
  ],
  [`Полка (Merch)_${COL[2]}`]: [
    'Share of Shelf vs конкуренты?',
    'OSA у конкурентов?'
  ],

  [`Бренды и Поставщики_${COL[0]}`]: [
    'SL, бэк-маржа, штрафы?',
    'СТМ: доля и маржа?',
    'Риски недопоставок?'
  ],
  [`Бренды и Поставщики_${COL[1]}`]: [
    'Сила брендов?',
    'Переключение между брендами?'
  ],
  [`Бренды и Поставщики_${COL[2]}`]: [
    'Представленность поставщиков (HHI)?',
    'Бренды/поставщики у конкурентов?'
  ]
}

export function createReportsFromIds(ids: string[], type: 'current' | 'new', mandatoryIds: string[] = []): Report[] {
  return ids.map(id => ({
    id,
    title: reportNames[id] || id,
    type,
    description: `${type === 'current' ? 'Текущий' : 'Новый'} отчёт ${id}`,
    isMandatory: mandatoryIds.includes(id)
  }))
}

const QUESTIONS_PER_CELL = 3

function buildCellQuestions(key: string, currentReportIds: string[]): string[] {
  const baseQuestions = cellQuestions[key] || []
  const comparison = comparisonQuestions[key]

  const prepend: string[] = []
  if (comparison) {
    const hasMagnit = currentReportIds.some((id) => REPORTS_WITH_MAGNIT.includes(id))
    const hasNielsen = currentReportIds.some((id) => REPORTS_WITH_NIELSEN.includes(id))
    if (hasMagnit && comparison.magnit) prepend.push(comparison.magnit)
    if (hasNielsen && comparison.nielsen) prepend.push(comparison.nielsen)
  }

  const all = prepend.length > 0 ? [...prepend, ...baseQuestions] : baseQuestions
  return all.slice(0, QUESTIONS_PER_CELL)
}

export function getMatrixCell(row: string, column: string): MatrixCell | null {
  const key = `${row}_${column}`
  const mapping = reportMapping[key]
  
  if (!mapping) return null
  
  const mandatoryForCell = mandatoryReports[key] || []
  const currentReports = createReportsFromIds(mapping.current, 'current', mandatoryForCell)
  const newReports = createReportsFromIds(mapping.new, 'new', mandatoryForCell)
  const allReports = [...currentReports, ...newReports]
  
  const totalReports = allReports.length
  const newReportsCount = newReports.length
  const newReportsPercent = totalReports > 0 ? Math.round((newReportsCount / totalReports) * 100) : 0

  const questions = buildCellQuestions(key, mapping.current)
  
  return {
    row,
    column,
    description: questions.join(' '),
    questions,
    reports: allReports,
    totalReports,
    newReportsCount,
    newReportsPercent,
    aiRecommendationKey: key
  }
}

export function getAllMatrixCells(): MatrixCell[] {
  const cells: MatrixCell[] = []
  
  for (const row of MATRIX_ROWS) {
    for (const column of MATRIX_COLUMNS) {
      const cell = getMatrixCell(row, column)
      if (cell) {
        cells.push(cell)
      }
    }
  }
  
  return cells
}

/**
 * Finds the matrix cell that contains the given report ID
 * Returns the first matching cell if report appears in multiple cells
 */
export function findCellByReportId(reportId: string | null | undefined): MatrixCell | null {
  if (!reportId) return null
  
  for (const [cellKey, mapping] of Object.entries(reportMapping)) {
    if (mapping.current.includes(reportId) || mapping.new.includes(reportId)) {
      const idx = cellKey.indexOf('_')
      const row = cellKey.slice(0, idx)
      const column = cellKey.slice(idx + 1)
      return getMatrixCell(row, column)
    }
  }
  
  return null
}

// E-commerce report IDs (step 4)
const ECOM_REPORT_IDS = ['NEW-REP-30', 'NEW-REP-31', 'NEW-REP-32', 'NEW-REP-33', 'NEW-REP-34']

/**
 * Returns preparation step Id for a report based on which column/section it belongs to.
 * Step 1 = Health, Step 2 = Shopper, Step 3 = External, Step 4 = e-com. Returns first match.
 */
export function getStepIdForReportId(reportId: string | null | undefined): number | null {
  if (!reportId) return null

  // E-com reports → step 4
  if (ECOM_REPORT_IDS.includes(reportId)) return 4

  for (let i = 0; i < COL.length; i++) {
    for (const [cellKey, mapping] of Object.entries(reportMapping)) {
      if (cellKey.endsWith(COL[i]) && (mapping.current.includes(reportId) || mapping.new.includes(reportId))) {
        return i + 1
      }
    }
  }
  return null
}
