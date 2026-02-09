import { useState, useMemo, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import scheduleData from '../../data/schedule_data.json'

export type DetailLevel = 'week' | 'month' | 'quarter'

const LABEL_COLUMN_WIDTH = 200
const CHART_PADDING = 24
const FIXED_DAY_WIDTH = 6

export interface ScheduleItem {
  weekDefense: number
  month: string
  dir: string
  rtn: string
  man: string
  category: string
  comment: string
  tn: string
  group: string
  weekPpd: number | string | null
  date: string
}

const CATEGORY_COLORS: Record<string, string> = {
  'ФУД': 'bg-amber-500',
  'ФРЕШ': 'bg-emerald-500',
  'НОНФУД': 'bg-blue-500',
  'УЛЬТРАФРЕШ': 'bg-purple-500',
  'АЛКОГОЛЬ, НАПИТКИ, ТАБАК': 'bg-rose-500',
  'ОиФ': 'bg-teal-500',
  '': 'bg-gray-400',
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? 'bg-indigo-500'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getWeekNumber(d: Date): number {
  const dCopy = new Date(d)
  dCopy.setHours(0, 0, 0, 0)
  dCopy.setDate(dCopy.getDate() + 4 - (dCopy.getDay() || 7))
  const yearStart = new Date(dCopy.getFullYear(), 0, 1)
  return Math.ceil((((dCopy.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export default function GanttChart({ detailLevel, fitToWidth }: { detailLevel: DetailLevel; fitToWidth: boolean }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth))
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const { tasks, minDate, maxDate, dayWidth, totalDays } = useMemo(() => {
    const data = scheduleData as ScheduleItem[]
    const validTasks = data.filter((t) => t.date && t.group)

    const dates = validTasks.map((t) => new Date(t.date).getTime())
    const min = Math.min(...dates)
    const max = Math.max(...dates)
    const minDate = new Date(min - 7 * 24 * 60 * 60 * 1000)
    const maxDate = new Date(max + 7 * 24 * 60 * 60 * 1000)
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000))

    let dayWidth: number
    if (fitToWidth) {
      const width = containerWidth || (typeof window !== 'undefined' ? window.innerWidth : 800)
      const timelineWidth = Math.max(0, width - LABEL_COLUMN_WIDTH - CHART_PADDING * 2)
      dayWidth = totalDays > 0 ? timelineWidth / totalDays : FIXED_DAY_WIDTH
    } else {
      dayWidth = FIXED_DAY_WIDTH
    }

    const tasks = validTasks.map((item, idx) => {
      const startDate = new Date(item.date)
      startDate.setDate(startDate.getDate() - 6)
      const endDate = new Date(item.date)
      return {
        ...item,
        id: idx,
        startDate,
        endDate,
        startMs: startDate.getTime(),
        endMs: endDate.getTime(),
      }
    })

    return {
      tasks,
      minDate,
      maxDate,
      dayWidth,
      totalDays,
    }
  }, [detailLevel, fitToWidth, containerWidth])

  const chartWidth = totalDays * dayWidth

  const getBarPosition = (startMs: number) => {
    const offset = (startMs - minDate.getTime()) / (24 * 60 * 60 * 1000)
    return offset * dayWidth
  }

  const getBarWidth = (startMs: number, endMs: number) => {
    const days = (endMs - startMs) / (24 * 60 * 60 * 1000) + 1
    return Math.max(days * dayWidth, 4)
  }

  const { timelineLabels, periodLineOffsets } = useMemo(() => {
    const labels: { label: string; offset: number }[] = []
    const lineOffsets: number[] = []
    const msPerDay = 24 * 60 * 60 * 1000
    const minLabelSpacing = 28

    if (detailLevel === 'week') {
      const start = new Date(minDate)
      start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1))
      const end = new Date(maxDate)
      const allWeeks: { label: string; offset: number }[] = []

      while (start <= end) {
        const weekStart = new Date(start)
        const offset = (weekStart.getTime() - minDate.getTime()) / msPerDay * dayWidth
        const weekNum = getWeekNumber(weekStart)
        allWeeks.push({ label: String(weekNum), offset })
        lineOffsets.push(offset)
        start.setDate(start.getDate() + 7)
      }

      const weekStep = Math.max(1, Math.ceil(allWeeks.length * minLabelSpacing / (chartWidth || 1)))
      allWeeks.forEach((w, i) => {
        if (i % weekStep === 0) labels.push(w)
      })
    } else if (detailLevel === 'month') {
      let current = new Date(minDate)
      current.setDate(1)
      const max = new Date(maxDate)
      const allMonths: { label: string; offset: number }[] = []

      while (current <= max) {
        const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
        const offset = (monthStart.getTime() - minDate.getTime()) / msPerDay * dayWidth
        allMonths.push({
          label: current.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
          offset,
        })
        lineOffsets.push(offset)
        current.setMonth(current.getMonth() + 1)
      }

      const monthStep = Math.max(1, Math.ceil(allMonths.length * minLabelSpacing / (chartWidth || 1)))
      allMonths.forEach((m, i) => {
        if (i % monthStep === 0) labels.push(m)
      })
    } else {
      let current = new Date(minDate.getFullYear(), Math.floor(minDate.getMonth() / 3) * 3, 1)
      const max = new Date(maxDate)

      while (current <= max) {
        const quarterStart = new Date(current.getFullYear(), current.getMonth(), 1)
        const offset = (quarterStart.getTime() - minDate.getTime()) / msPerDay * dayWidth
        const q = Math.floor(current.getMonth() / 3) + 1
        labels.push({
          label: `Q${q} ${current.getFullYear().toString().slice(2)}`,
          offset,
        })
        lineOffsets.push(offset)
        current.setMonth(current.getMonth() + 3)
      }
    }
    const filteredLines = lineOffsets.filter((o) => o > 1)
    return { timelineLabels: labels, periodLineOffsets: filteredLines }
  }, [minDate, maxDate, dayWidth, detailLevel, chartWidth])

  const hoveredTask = hoveredId !== null ? tasks.find((t) => t.id === hoveredId) : null

  const fullChartWidth = chartWidth + LABEL_COLUMN_WIDTH

  return (
    <div ref={containerRef} className={clsx('w-full overflow-y-auto p-6', !fitToWidth && 'overflow-x-auto')}>
        <div className={fitToWidth ? 'w-full min-w-0' : 'min-w-max'}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className={fitToWidth ? 'overflow-hidden' : 'overflow-x-auto'}>
              <div style={{ minWidth: fitToWidth ? undefined : fullChartWidth, width: fitToWidth ? '100%' : undefined }}>
                <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: fitToWidth ? `${LABEL_COLUMN_WIDTH}px 1fr` : `${LABEL_COLUMN_WIDTH}px ${chartWidth}px` }}>
                  <div className="p-3 bg-gray-50 font-semibold text-gray-700 text-sm border-r border-gray-200 sticky left-0 z-10 bg-gray-50">
                    Категория / Группа
                  </div>
                  <div className="relative border-l border-gray-200" style={{ minHeight: 48, width: fitToWidth ? undefined : chartWidth }}>
                    {periodLineOffsets.map((offset, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-gray-200"
                        style={{ left: offset }}
                      />
                    ))}
                    {timelineLabels.map((l, i) => (
                      <div
                        key={`l-${i}`}
                        className="absolute top-0 bottom-0 text-xs text-gray-500 font-medium px-2 py-2"
                        style={{ left: l.offset }}
                      >
                        {l.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                  {tasks.map((task) => {
                    const left = getBarPosition(task.startMs)
                    const width = getBarWidth(task.startMs, task.endMs)
                    const colorClass = getCategoryColor(task.category)

                    return (
                      <div
                        key={task.id}
                        className="grid border-b border-gray-100 hover:bg-gray-50/50 transition-colors group"
                        style={{ gridTemplateColumns: fitToWidth ? `${LABEL_COLUMN_WIDTH}px 1fr` : `${LABEL_COLUMN_WIDTH}px ${chartWidth}px`, minHeight: 36 }}
                      >
                        <div className="p-2 flex items-center text-sm text-gray-700 border-r border-gray-100 truncate sticky left-0 z-10 bg-white group-hover:bg-gray-50/50">
                          <span className="font-medium truncate" title={task.group}>
                            {task.group || '—'}
                          </span>
                        </div>
                        <div className="relative flex items-center py-1" style={{ minHeight: 36 }}>
                          {periodLineOffsets.map((offset, i) => (
                            <div
                              key={i}
                              className="absolute top-0 bottom-0 w-px bg-gray-200 pointer-events-none"
                              style={{ left: offset }}
                            />
                          ))}
                          <div
                            className={`absolute h-6 rounded-md ${colorClass} opacity-90 cursor-pointer transition-all duration-150 hover:opacity-100 hover:scale-105 hover:z-10 hover:shadow-md`}
                            style={{
                              left: `${left}px`,
                              width: `${width}px`,
                              minWidth: 4,
                            }}
                            onMouseEnter={(e) => {
                              setHoveredId(task.id)
                              setTooltipPos({ x: e.clientX, y: e.clientY })
                            }}
                            onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setHoveredId(null)}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {hoveredTask && (
          <div
            className="fixed z-50 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl max-w-sm pointer-events-none"
            style={{
              left: Math.min(tooltipPos.x + 16, window.innerWidth - 320),
              top: Math.min(tooltipPos.y + 16, window.innerHeight - 280),
            }}
          >
            <div className="font-semibold text-base mb-2">{hoveredTask.group}</div>
            <div className="space-y-1 text-gray-300">
              <div>
                <span className="text-gray-400">Категория:</span> {hoveredTask.category || '—'}
              </div>
              <div>
                <span className="text-gray-400">Дата:</span> {formatDate(hoveredTask.date)}
              </div>
              <div>
                <span className="text-gray-400">Неделя защиты:</span> {hoveredTask.weekDefense}
              </div>
              <div>
                <span className="text-gray-400">DIR:</span> {hoveredTask.dir || '—'}
              </div>
              <div>
                <span className="text-gray-400">RTN:</span> {hoveredTask.rtn || '—'}
              </div>
              {hoveredTask.man && (
                <div>
                  <span className="text-gray-400">Менеджер:</span> {hoveredTask.man}
                </div>
              )}
              {hoveredTask.tn && (
                <div>
                  <span className="text-gray-400">ТН:</span> {hoveredTask.tn}
                </div>
              )}
              {hoveredTask.comment && (
                <div>
                  <span className="text-gray-400">Коммент:</span> {hoveredTask.comment}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  )
}
