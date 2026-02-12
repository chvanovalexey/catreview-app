import { useState } from 'react'
import { Sparkles, ThumbsUp, ThumbsDown, RotateCcw, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface SkuRecommendation {
  sku: string
  name: string
  action: 'ввод' | 'вывод' | 'ротация'
  reason: string
  expectedImpact: { revenue: number; margin: number }
  confidence: number // 0-100
  accepted?: boolean
}

const MOCK_RECOMMENDATIONS: SkuRecommendation[] = [
  {
    sku: 'SKU-2045',
    name: 'Молоко стерилизованное 3.2% 1л (производитель А)',
    action: 'вывод',
    reason: 'Низкие продажи (C-класс ABC), XYZ = Z (нестабильный спрос). Дублирует SKU-2041 того же производителя. Высвободит полочное пространство для растущих позиций.',
    expectedImpact: { revenue: -2, margin: +1 },
    confidence: 87,
  },
  {
    sku: 'SKU-3112',
    name: 'Йогурт питьевой клубника 250мл (бренд Б)',
    action: 'вывод',
    reason: 'Падение продаж -15% LFL за 3 мес. D-класс ABC. Потеря доли к конкурентному бренду. Низкая маржинальность (12%).',
    expectedImpact: { revenue: -3, margin: +0.5 },
    confidence: 72,
  },
  {
    sku: 'NEW-0891',
    name: 'Кефир безлактозный 2.5% 450мл (бренд В)',
    action: 'ввод',
    reason: 'Тренд роста безлактозных продуктов +34% г/г на рынке. У конкурентов (Магнит, Пятёрочка) позиция в ТОП-50. У Дикси отсутствует. Прогнозируемый спрос — 120 шт./мес. на магазин.',
    expectedImpact: { revenue: +5, margin: +2 },
    confidence: 81,
  },
  {
    sku: 'NEW-0902',
    name: 'Творог зернёный 5% 300г (СТМ Дикси)',
    action: 'ввод',
    reason: 'Gap vs конкуренты: у Магнита аналог в ТОП-30 по продажам. СТМ-позиция обеспечит маржу ~30%. Сегмент зернёного творога растёт +12% г/г.',
    expectedImpact: { revenue: +8, margin: +4 },
    confidence: 78,
  },
  {
    sku: 'SKU-1567',
    name: 'Сметана 20% 400г (бренд Г)',
    action: 'ротация',
    reason: 'Заменить на SKU от поставщика Д с лучшими условиями: бэк-маржа +5 п.п., аналогичное качество. Рекомендация по результатам тендера.',
    expectedImpact: { revenue: 0, margin: +3 },
    confidence: 91,
  },
  {
    sku: 'NEW-1203',
    name: 'Растительное молоко овсяное 1л (бренд Е)',
    action: 'ввод',
    reason: 'Растительное молоко — самый быстрорастущий сегмент (+48% г/г). Овсяное — лидер подкатегории (62% доли). Позиция есть у всех ключевых конкурентов.',
    expectedImpact: { revenue: +6, margin: +2.5 },
    confidence: 85,
  },
]

export default function SkuRotationAI() {
  const [recommendations, setRecommendations] = useState<SkuRecommendation[]>(MOCK_RECOMMENDATIONS)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAccept = (sku: string, accepted: boolean) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.sku === sku ? { ...r, accepted } : r))
    )
  }

  const handleReanalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => setIsAnalyzing(false), 1500)
  }

  const acceptedCount = recommendations.filter((r) => r.accepted === true).length
  const rejectedCount = recommendations.filter((r) => r.accepted === false).length
  const pendingCount = recommendations.filter((r) => r.accepted === undefined).length

  const totalRevenue = recommendations
    .filter((r) => r.accepted !== false)
    .reduce((s, r) => s + r.expectedImpact.revenue, 0)
  const totalMargin = recommendations
    .filter((r) => r.accepted !== false)
    .reduce((s, r) => s + r.expectedImpact.margin, 0)

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'ввод':
        return { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: TrendingUp }
      case 'вывод':
        return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: TrendingDown }
      case 'ротация':
        return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: RotateCcw }
      default:
        return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: AlertTriangle }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">ИИ-рекомендации по ротации SKU</h3>
            <p className="text-xs text-gray-500">На основе ABC/XYZ анализа, трендов рынка и конкурентного окружения</p>
          </div>
        </div>
        <button
          onClick={handleReanalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200 disabled:opacity-50 transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Анализирую...' : 'Переанализировать'}
        </button>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            Принято: <strong className="text-green-600">{acceptedCount}</strong>
          </span>
          <span className="text-gray-600">
            Отклонено: <strong className="text-red-600">{rejectedCount}</strong>
          </span>
          <span className="text-gray-600">
            Ожидает: <strong className="text-amber-600">{pendingCount}</strong>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="text-gray-500">Ожидаемый эффект:</span>
          <span className="font-medium text-green-600">
            {totalRevenue >= 0 ? '+' : ''}{totalRevenue} млн руб.
          </span>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-blue-600">
            Маржа {totalMargin >= 0 ? '+' : ''}{totalMargin} млн руб.
          </span>
        </div>
      </div>

      {/* Recommendations list */}
      <div className="space-y-3">
        {recommendations.map((rec) => {
          const style = getActionStyle(rec.action)
          const ActionIcon = style.icon
          const isAccepted = rec.accepted === true
          const isRejected = rec.accepted === false

          return (
            <div
              key={rec.sku}
              className={`p-4 rounded-lg border transition-all ${
                isRejected
                  ? 'bg-gray-50 border-gray-200 opacity-50'
                  : isAccepted
                    ? 'bg-green-50/50 border-green-200'
                    : `${style.bg}`
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded ${style.bg} border ${isRejected ? 'opacity-50' : ''}`}>
                  <ActionIcon className={`w-4 h-4 ${style.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${style.bg} ${style.text} border`}>
                      {rec.action}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{rec.sku}</span>
                    <span className="text-sm text-gray-600 truncate">{rec.name}</span>
                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                      Уверенность: {rec.confidence}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={rec.expectedImpact.revenue >= 0 ? 'text-green-600' : 'text-red-600'}>
                      Выручка: {rec.expectedImpact.revenue >= 0 ? '+' : ''}{rec.expectedImpact.revenue} млн
                    </span>
                    <span className={rec.expectedImpact.margin >= 0 ? 'text-blue-600' : 'text-red-600'}>
                      Маржа: {rec.expectedImpact.margin >= 0 ? '+' : ''}{rec.expectedImpact.margin} млн
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleAccept(rec.sku, true)}
                    className={`p-2 rounded-lg transition-colors ${
                      isAccepted
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title="Принять рекомендацию"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAccept(rec.sku, false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isRejected
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title="Отклонить рекомендацию"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
