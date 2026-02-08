import { create } from 'zustand'
import { MatrixCell } from '../types'

interface AppState {
  selectedCell: MatrixCell | null
  selectedReportId: string | null
  isAIChatOpen: boolean
  aiChatCell: MatrixCell | null
  aiChatReportId: string | null // Для режима конкретного отчёта
  isTasksPanelOpen: boolean
  setSelectedCell: (cell: MatrixCell | null) => void
  setSelectedReportId: (id: string | null) => void
  openAIChat: (cell: MatrixCell) => void // Режим агрегации по ячейке
  openAIChatForReport: (reportId: string) => void // Режим конкретного отчёта
  closeAIChat: () => void
  toggleTasksPanel: () => void
  openTasksPanel: () => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedCell: null,
  selectedReportId: null,
  isAIChatOpen: false,
  aiChatCell: null,
  aiChatReportId: null,
  isTasksPanelOpen: false,
  setSelectedCell: (cell) => set({ selectedCell: cell }),
  setSelectedReportId: (id) => set({ selectedReportId: id }),
  openAIChat: (cell) => set({ isAIChatOpen: true, aiChatCell: cell, aiChatReportId: null }),
  openAIChatForReport: (reportId) => set({ isAIChatOpen: true, aiChatCell: null, aiChatReportId: reportId }),
  closeAIChat: () => set({ isAIChatOpen: false, aiChatCell: null, aiChatReportId: null }),
  toggleTasksPanel: () => set((state) => ({ isTasksPanelOpen: !state.isTasksPanelOpen })),
  openTasksPanel: () => set({ isTasksPanelOpen: true }),
}))