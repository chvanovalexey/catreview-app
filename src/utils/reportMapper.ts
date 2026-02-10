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
}

const COL = MATRIX_COLUMNS

// Mapping: Lever × Super-logic → reports
const reportMapping: Record<string, { current: string[], new: string[] }> = {
  // === Ассортимент (Ядро категории) ===
  [`Ассортимент_${COL[0]}`]: {
    current: ['REP-01', 'REP-02', 'REP-03'],
    new: ['NEW-REP-19', 'NEW-REP-20', 'NEW-REP-21']
  },
  [`Ассортимент_${COL[1]}`]: {
    current: ['REP-04', 'REP-14'],
    new: ['NEW-REP-01', 'NEW-REP-02', 'NEW-REP-03']
  },
  [`Ассортимент_${COL[2]}`]: {
    current: ['REP-08', 'REP-09', 'REP-10', 'REP-11', 'REP-13', 'REP-06', 'REP-19'],
    new: ['NEW-REP-11', 'NEW-REP-13']
  },

  // === Цена и Промо (Восприятие ценности) ===
  [`Цена и Промо_${COL[0]}`]: {
    current: ['REP-16', 'REP-15'],
    new: ['NEW-REP-22']
  },
  [`Цена и Промо_${COL[1]}`]: {
    current: ['REP-04'],
    new: ['NEW-REP-04', 'NEW-REP-05']
  },
  [`Цена и Промо_${COL[2]}`]: {
    current: ['REP-05', 'REP-20'],
    new: ['NEW-REP-14', 'NEW-REP-15']
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
    new: ['NEW-REP-16', 'NEW-REP-17']
  },

  // === Бренды и Поставщики (Закупка) ===
  [`Бренды и Поставщики_${COL[0]}`]: {
    current: ['REP-12', 'REP-18'],
    new: ['NEW-REP-25', 'NEW-REP-26']
  },
  [`Бренды и Поставщики_${COL[1]}`]: {
    current: [],
    new: ['NEW-REP-10']
  },
  [`Бренды и Поставщики_${COL[2]}`]: {
    current: ['REP-12'],
    new: ['NEW-REP-12', 'NEW-REP-18']
  }
}

// Вопросы, на которые категорийный менеджер может ответить с помощью отчётов в ячейке
const cellQuestions: Record<string, string[]> = {
  [`Ассортимент_${COL[0]}`]: [
    'Падаем или растем? Выполняем ли роль категории?',
    'Какой процент ассортимента — «хвост» с низкой оборачиваемостью?',
    'Какая структура P&L от Gross Sales до Net Margin?'
  ],
  [`Ассортимент_${COL[1]}`]: [
    'Покрываем ли мы потребности (CDT)? Правильная ли ценовая лестница?',
    'В каких миссиях покупатели приходят в категорию?',
    'Как покупатели переключаются между SKU внутри категории?'
  ],
  [`Ассортимент_${COL[2]}`]: [
    'Что есть у конкурентов, чего нет у нас?',
    'Какие топ-SKU рынка у нас отсутствуют?',
    'Какая доля уникального ассортимента vs конкуренты?'
  ],

  [`Цена и Промо_${COL[0]}`]: [
    'Падаем или растем? Эффективность промо (Uplift/ROI)?',
    'Каннибализирует ли промо регулярные продажи?',
    'Какой эффект от инвестиций в цену и EDLP?'
  ],
  [`Цена и Промо_${COL[1]}`]: [
    'Как покупатели воспринимают наши цены (PPI)?',
    'Корректна ли ценовая лестница? Какие KVI-товары?',
    'Какая эластичность спроса по ценовым сегментам?'
  ],
  [`Цена и Промо_${COL[2]}`]: [
    'Где мы дороже конкурентов? (PI ценовой индекс)',
    'Какая доля промо у конкурентов? Промо-давление?',
    'Совпадают ли наши ценовые лестницы с рынком?'
  ],

  [`Полка (Merch)_${COL[0]}`]: [
    'Какие продажи/маржа на погонный метр?',
    'OSA: какой % времени товар доступен на полке?',
    'Каковы потери и товарные запасы?'
  ],
  [`Полка (Merch)_${COL[1]}`]: [
    'Понятна ли планограмма покупателю? (Айтрекинг)',
    'Соответствует ли выкладка дереву CDT?',
    'NPS и CSI: удовлетворённость категорией?'
  ],
  [`Полка (Merch)_${COL[2]}`]: [
    'Share of Shelf: наша доля полки vs конкуренты?',
    'Какая доступность у конкурентов? (OSA Benchmark)'
  ],

  [`Бренды и Поставщики_${COL[0]}`]: [
    'Уровень сервиса (SL), бэк-маржа, штрафы?',
    'Как работает СТМ? Доля и маржа?',
    'Какие риски по недопоставкам?'
  ],
  [`Бренды и Поставщики_${COL[1]}`]: [
    'Сила брендов: знание, лояльность?',
    'Как покупатели переключаются между брендами?'
  ],
  [`Бренды и Поставщики_${COL[2]}`]: [
    'Представленность поставщиков у конкурентов? (HHI)',
    'Какие бренды/поставщики есть у конкурентов?'
  ]
}

export function createReportsFromIds(ids: string[], type: 'current' | 'new'): Report[] {
  return ids.map(id => ({
    id,
    title: reportNames[id] || id,
    type,
    description: `${type === 'current' ? 'Текущий' : 'Новый'} отчёт ${id}`
  }))
}

export function getMatrixCell(row: string, column: string): MatrixCell | null {
  const key = `${row}_${column}`
  const mapping = reportMapping[key]
  
  if (!mapping) return null
  
  const currentReports = createReportsFromIds(mapping.current, 'current')
  const newReports = createReportsFromIds(mapping.new, 'new')
  const allReports = [...currentReports, ...newReports]
  
  const totalReports = allReports.length
  const newReportsCount = newReports.length
  const newReportsPercent = totalReports > 0 ? Math.round((newReportsCount / totalReports) * 100) : 0
  
  return {
    row,
    column,
    description: cellQuestions[key]?.join(' ') || '',
    questions: cellQuestions[key] || [],
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
