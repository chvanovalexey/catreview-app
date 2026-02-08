import { useMemo } from 'react'
import managerCommentsData from '../data/manager_comments.json'
import tasksData from '../data/tasks.json'
import { ManagerComments, Task } from '../types'

export function useReportComments(reportId: string | null) {
  const comments = useMemo(() => {
    if (!reportId) return []
    const commentsData = managerCommentsData as ManagerComments
    return commentsData[reportId] || []
  }, [reportId])
  
  return comments
}

export function useReportTasks(reportId: string | null) {
  const tasks = useMemo(() => {
    if (!reportId) return []
    const tasksList = tasksData as Task[]
    return tasksList.filter(task => task.report_id === reportId)
  }, [reportId])
  
  return tasks
}

export function useAllTasks() {
  const tasks = useMemo(() => {
    return tasksData as Task[]
  }, [])
  
  return tasks
}