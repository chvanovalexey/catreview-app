import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useReportComments } from '../../hooks/useReports'
import { formatDate } from '../../utils/formatters'

interface CommentsListProps {
  reportId: string
}

export default function CommentsList({ reportId }: CommentsListProps) {
  const comments = useReportComments(reportId)
  const [newComment, setNewComment] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  
  const handleAddComment = () => {
    if (newComment.trim()) {
      // Mock: In real app, this would call an API
      console.log('Adding comment:', newComment)
      setNewComment('')
      setIsAdding(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Комментарии</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>
      
      {isAdding && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Введите комментарий..."
            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewComment('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Нет комментариев
          </p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-900">{comment.author}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
              </div>
              <p className="text-sm text-gray-700">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}