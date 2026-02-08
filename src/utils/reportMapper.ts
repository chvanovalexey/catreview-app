import { MatrixCell, Report } from '../types'

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

// Mapping from report-list.txt
const reportMapping: Record<string, { current: string[], new: string[] }> = {
  'Покупатель_Ассортимент': {
    current: ['REP-04'],
    new: ['NEW-REP-01', 'NEW-REP-02', 'NEW-REP-03']
  },
  'Покупатель_Цена/Промо': {
    current: ['REP-04', 'REP-15'],
    new: ['NEW-REP-04', 'NEW-REP-05']
  },
  'Покупатель_Выкладка': {
    current: [],
    new: ['NEW-REP-06', 'NEW-REP-07']
  },
  'Покупатель_Операции': {
    current: [],
    new: ['NEW-REP-08', 'NEW-REP-09']
  },
  'Покупатель_Поставщики': {
    current: [],
    new: ['NEW-REP-10']
  },
  'Рынок_Ассортимент': {
    current: ['REP-08', 'REP-09', 'REP-10', 'REP-11', 'REP-13'],
    new: ['NEW-REP-11']
  },
  'Рынок_Цена/Промо': {
    current: [],
    new: []
  },
  'Рынок_Выкладка': {
    current: [],
    new: []
  },
  'Рынок_Операции': {
    current: [],
    new: []
  },
  'Рынок_Поставщики': {
    current: ['REP-12'],
    new: ['NEW-REP-12']
  },
  'Конкуренция_Ассортимент': {
    current: ['REP-06', 'REP-19'],
    new: ['NEW-REP-13']
  },
  'Конкуренция_Цена/Промо': {
    current: ['REP-20', 'REP-05'],
    new: ['NEW-REP-14', 'NEW-REP-15']
  },
  'Конкуренция_Выкладка': {
    current: [],
    new: ['NEW-REP-16']
  },
  'Конкуренция_Операции': {
    current: [],
    new: ['NEW-REP-17']
  },
  'Конкуренция_Поставщики': {
    current: [],
    new: ['NEW-REP-18']
  },
  'Экономика_Ассортимент': {
    current: ['REP-01', 'REP-02', 'REP-03'],
    new: ['NEW-REP-19', 'NEW-REP-20', 'NEW-REP-21']
  },
  'Экономика_Цена/Промо': {
    current: ['REP-16', 'REP-15'],
    new: ['NEW-REP-22']
  },
  'Экономика_Выкладка': {
    current: [],
    new: ['NEW-REP-23']
  },
  'Экономика_Операции': {
    current: ['REP-17'],
    new: ['NEW-REP-24']
  },
  'Экономика_Поставщики': {
    current: ['REP-12', 'REP-18'],
    new: ['NEW-REP-25', 'NEW-REP-26']
  }
}

const cellDescriptions: Record<string, string> = {
  'Покупатель_Ассортимент': 'Опросы, Исследования - Восприятие ассортимента',
  'Покупатель_Цена/Промо': 'Исследование - Восприятие цен',
  'Покупатель_Выкладка': 'Соответствие CDT',
  'Покупатель_Операции': 'Опросы, Исследования - NPS',
  'Покупатель_Поставщики': 'Опросы, Исследования - отношение к брендам',
  'Рынок_Ассортимент': 'Анализ рынка',
  'Рынок_Поставщики': 'Анализ основных поставщиков',
  'Конкуренция_Ассортимент': 'Визиты в магазины, Рыночные данные',
  'Конкуренция_Цена/Промо': 'Мониторинги',
  'Конкуренция_Выкладка': 'Визиты в магазины',
  'Конкуренция_Операции': 'Визиты магазины - Наличие товаров у конкурентов',
  'Конкуренция_Поставщики': 'Визиты в магазины - бренды у конкурентов',
  'Экономика_Ассортимент': 'Анализ продаж и прибыли',
  'Экономика_Цена/Промо': 'Анализ эффективности промо',
  'Экономика_Выкладка': 'Анализ маржи на метр полки',
  'Экономика_Операции': 'Анализ доступности',
  'Экономика_Поставщики': 'Анализ продаж/маржи/шт. по поставщикам'
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
    description: cellDescriptions[key] || '',
    reports: allReports,
    totalReports,
    newReportsCount,
    newReportsPercent,
    aiRecommendationKey: key
  }
}

export function getAllMatrixCells(): MatrixCell[] {
  const rows = ['Покупатель', 'Рынок', 'Конкуренция', 'Экономика']
  const columns = ['Ассортимент', 'Цена/Промо', 'Выкладка', 'Операции', 'Поставщики']
  
  const cells: MatrixCell[] = []
  
  for (const row of rows) {
    for (const column of columns) {
      const cell = getMatrixCell(row, column)
      if (cell && cell.totalReports > 0) {
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
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/2c6270e7-c8fd-4efd-bf56-949c2db26996',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reportMapper.ts:findCellByReportId',message:'Finding cell for reportId',data:{reportId},timestamp:Date.now(),runId:'initial',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Search through all cells to find which one contains this report
  for (const [cellKey, mapping] of Object.entries(reportMapping)) {
    const [row, column] = cellKey.split('_')
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/2c6270e7-c8fd-4efd-bf56-949c2db26996',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reportMapper.ts:findCellByReportId',message:'Checking cell',data:{cellKey,row,column,currentReports:mapping.current,newReports:mapping.new,reportId},timestamp:Date.now(),runId:'initial',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Check if report is in current or new reports
    if (mapping.current.includes(reportId) || mapping.new.includes(reportId)) {
      const cell = getMatrixCell(row, column)
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/2c6270e7-c8fd-4efd-bf56-949c2db26996',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reportMapper.ts:findCellByReportId',message:'Found matching cell',data:{cellKey,aiRecommendationKey:cell?.aiRecommendationKey,reportId},timestamp:Date.now(),runId:'initial',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      return cell
    }
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/2c6270e7-c8fd-4efd-bf56-949c2db26996',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reportMapper.ts:findCellByReportId',message:'No cell found for reportId',data:{reportId},timestamp:Date.now(),runId:'initial',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  return null
}