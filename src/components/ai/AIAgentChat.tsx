import { useState, useRef, useEffect, useMemo } from 'react'
import { X, Send, Bot } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import aiRecommendationsData from '../../data/ai_recommendations.json'
import aiRecommendationsByReportData from '../../data/ai_recommendations_by_report.json'
import { AIRecommendations, AIRecommendation } from '../../types'

export default function AIAgentChat() {
  const { isAIChatOpen, aiChatCell, aiChatReportId, closeAIChat } = useAppStore()
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const cellRecommendations = aiRecommendationsData as AIRecommendations
  const reportRecommendations = aiRecommendationsByReportData as Record<string, AIRecommendation>
  
  // Определяем режим работы и формируем рекомендацию
  const recommendation = useMemo(() => {
    // Режим конкретного отчёта
    if (aiChatReportId) {
      return reportRecommendations[aiChatReportId] || null
    }
    
    // Режим агрегации по ячейке - собираем рекомендации всех отчётов в ячейке
    if (aiChatCell && aiChatCell.reports.length > 0) {
      const reportRecsWithNames = aiChatCell.reports
        .map(report => {
          const rec = reportRecommendations[report.id]
          return rec ? { report, recommendation: rec } : null
        })
        .filter((item): item is { report: typeof aiChatCell.reports[0], recommendation: AIRecommendation } => item !== null)
      
      if (reportRecsWithNames.length === 0) {
        // Fallback на старую логику по ячейке, если нет рекомендаций по отчётам
        return cellRecommendations[aiChatCell.aiRecommendationKey] || null
      }
      
      // Агрегируем рекомендации всех отчётов
      const aggregatedRecommendation: AIRecommendation = {
        recommendation: reportRecsWithNames
          .map(({ report, recommendation }) => {
            return `**${report.title}:** ${recommendation.recommendation}`
          })
          .join('\n\n'),
        chat_examples: reportRecsWithNames.flatMap(({ recommendation }) => recommendation.chat_examples).slice(0, 4) // Берем первые 4 примера
      }
      
      return aggregatedRecommendation
    }
    
    return null
  }, [aiChatCell, aiChatReportId, cellRecommendations, reportRecommendations])
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/2c6270e7-c8fd-4efd-bf56-949c2db26996',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIAgentChat.tsx:useEffect',message:'Recommendation state changed',data:{isAIChatOpen,hasAiChatCell:!!aiChatCell,aiChatReportId,aiRecommendationKey:aiChatCell?.aiRecommendationKey,hasRecommendation:!!recommendation,recommendationPreview:recommendation?.recommendation?.substring(0,50)},timestamp:Date.now(),runId:'initial',hypothesisId:'D'})}).catch(()=>{});
  }, [isAIChatOpen, aiChatCell, aiChatReportId, recommendation]);
  // #endregion
  
  useEffect(() => {
    if (isAIChatOpen && recommendation) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/2c6270e7-c8fd-4efd-bf56-949c2db26996',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIAgentChat.tsx:useEffect',message:'Setting recommendation message',data:{aiRecommendationKey:aiChatCell?.aiRecommendationKey,recommendationLength:recommendation.recommendation.length},timestamp:Date.now(),runId:'initial',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      setMessages([
        {
          role: 'assistant',
          content: recommendation.recommendation
        }
      ])
    } else {
      setMessages([])
    }
  }, [isAIChatOpen, recommendation])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleSend = () => {
    if (!input.trim()) return
    
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Mock response with delay
    setTimeout(() => {
      const mockResponse = recommendation?.chat_examples[0]?.answer || 
        'Спасибо за ваш вопрос. Я проанализирую данные и предоставлю рекомендацию.'
      setMessages(prev => [...prev, { role: 'assistant', content: mockResponse }])
    }, 1000)
  }
  
  const handleExampleClick = (question: string) => {
    setInput(question)
  }
  
  // Простая функция для рендеринга markdown (жирный текст)
  const renderMarkdown = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2)
        return <strong key={idx}>{content}</strong>
      }
      return <span key={idx}>{part}</span>
    })
  }
  
  if (!isAIChatOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <h2 className="text-lg font-semibold">ИИ-агент</h2>
          </div>
          <button
            onClick={closeAIChat}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {recommendation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                {aiChatReportId ? 'Рекомендация ИИ по отчёту' : 'Итоговая рекомендация ИИ по ячейке'}
              </h3>
              <div className="text-sm text-blue-800 whitespace-pre-line">
                {renderMarkdown(recommendation.recommendation)}
              </div>
            </div>
          )}
          
          {recommendation && recommendation.chat_examples.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Примеры вопросов:</p>
              {recommendation.chat_examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example.question)}
                  className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  {example.question}
                </button>
              ))}
            </div>
          )}
          
          <div className="space-y-4 mt-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="w-4 h-4" />
                      <span className="text-xs font-medium">ИИ-агент</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Задайте вопрос..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}