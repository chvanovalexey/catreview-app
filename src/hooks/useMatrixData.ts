import { useMemo } from 'react'
import { getAllMatrixCells, getMatrixCell, MATRIX_ROWS, MATRIX_COLUMNS } from '../utils/reportMapper'
import { MatrixCell } from '../types'

export function useMatrixData() {
  const cells = useMemo(() => getAllMatrixCells(), [])
  
  const rows = [...MATRIX_ROWS]
  const columns = [...MATRIX_COLUMNS]
  
  const getCell = (row: string, column: string): MatrixCell | null => {
    return getMatrixCell(row, column)
  }
  
  return { cells, rows, columns, getCell }
}