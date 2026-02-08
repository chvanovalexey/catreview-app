import { useMemo } from 'react'
import { getAllMatrixCells, getMatrixCell } from '../utils/reportMapper'
import { MatrixCell } from '../types'

export function useMatrixData() {
  const cells = useMemo(() => getAllMatrixCells(), [])
  
  const rows = ['Покупатель', 'Рынок', 'Конкуренция', 'Экономика']
  const columns = ['Ассортимент', 'Цена/Промо', 'Выкладка', 'Операции', 'Поставщики']
  
  const getCell = (row: string, column: string): MatrixCell | null => {
    return getMatrixCell(row, column)
  }
  
  return { cells, rows, columns, getCell }
}