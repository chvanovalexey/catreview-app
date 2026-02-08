import { useMemo } from 'react'
import tasksData from '../data/tasks.json'
import { Task } from '../types'

export function useTasks(filter?: string) {
  const tasks = useMemo(() => {
    const allTasks = tasksData as Task[]
    if (!filter || filter === 'Все') {
      return allTasks
    }
    return allTasks.filter(task => task.status === filter)
  }, [filter])
  
  const stats = useMemo(() => {
    const allTasks = tasksData as Task[]
    const totalRevenue = allTasks.reduce((sum, task) => sum + task.revenue_impact_million, 0)
    const totalMargin = allTasks.reduce((sum, task) => sum + task.margin_impact_million, 0)
    
    const byStatus = allTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalRevenue,
      totalMargin,
      byStatus,
      total: allTasks.length
    }
  }, [])
  
  return { tasks, stats }
}