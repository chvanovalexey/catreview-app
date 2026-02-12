import { useNavigate } from 'react-router-dom'
import { RotateCcw, FileSpreadsheet, Presentation } from 'lucide-react'
import { usePreparationStore } from '../../store/preparationStore'
import { formatShortDate } from '../../utils/formatters'
import { ImpactBadges } from './ImpactBadges'

export default function FinalSummary() {
  const navigate = useNavigate()
  const {
    startDate,
    allInitiatives,
    resetPreparation,
  } = usePreparationStore()

  const completionDate = new Date().toISOString().split('T')[0]
  const totalRevenue = allInitiatives.reduce((s, t) => s + t.revenue_impact_million, 0)
  const totalMargin = allInitiatives.reduce((s, t) => s + t.margin_impact_million, 0)

  const handleReset = () => {
    if (window.confirm('Начать подготовку заново? Все данные будут сброшены.')) {
      resetPreparation()
      navigate('/preparation/step/1')
    }
  };

  const handleExportExcel = () => {
    alert('Экспорт в Excel будет доступен в следующей версии.')
  }

  const handleExportPresentation = () => {
    alert('Генерация презентации будет доступна в следующей версии.')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Финализация</h2>
        <p className="text-gray-600 mt-1">Итоговый summary подготовки к защите категории</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Дата начала</p>
          <p className="font-semibold text-gray-900">{formatShortDate(startDate)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Дата завершения</p>
          <p className="font-semibold text-gray-900">{formatShortDate(completionDate)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Сумма амбиций</p>
          <ImpactBadges revenue={totalRevenue} margin={totalMargin} variant="compact" size="lg" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Экспорт в Excel
        </button>
        <button
          onClick={handleExportPresentation}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <Presentation className="w-5 h-5" />
          Сгенерировать презентацию
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RotateCcw className="w-5 h-5" />
          Начать заново
        </button>
      </div>
    </div>
  )
}
