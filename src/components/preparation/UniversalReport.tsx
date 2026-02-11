import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

// Пример иерархии товарного классификатора: категория → подкатегория → группа → подгруппа → SKU
interface HierarchyNode {
  id: string
  name: string
  children?: HierarchyNode[]
  metrics: {
    revenue: number
    margin: number
    share: number
    lfl: number
  }
}

const SAMPLE_DATA: HierarchyNode[] = [
  {
    id: 'cat-1',
    name: 'Молочные продукты',
    metrics: { revenue: 12500, margin: 1850, share: 22.5, lfl: 3.2 },
    children: [
      {
        id: 'sub-1-1',
        name: 'Молоко',
        metrics: { revenue: 5200, margin: 780, share: 9.4, lfl: 2.1 },
        children: [
          {
            id: 'grp-1-1-1',
            name: 'Молоко питьевое',
            metrics: { revenue: 3800, margin: 570, share: 6.8, lfl: 1.8 },
            children: [
              {
                id: 'sg-1',
                name: 'Молоко 3.2%',
                metrics: { revenue: 2100, margin: 315, share: 3.8, lfl: 2.5 },
                children: [
                  { id: 'sku-1', name: 'Простоквашино 3.2% 1л', metrics: { revenue: 450, margin: 68, share: 0.8, lfl: 1.2 } },
                  { id: 'sku-2', name: 'Домик в деревне 3.2% 1л', metrics: { revenue: 380, margin: 57, share: 0.7, lfl: -0.5 } },
                ],
              },
              {
                id: 'sg-2',
                name: 'Молоко 2.5%',
                metrics: { revenue: 1200, margin: 180, share: 2.2, lfl: 0.9 },
                children: [
                  { id: 'sku-3', name: 'Простоквашино 2.5% 1л', metrics: { revenue: 320, margin: 48, share: 0.6, lfl: 2.1 } },
                ],
              },
            ],
          },
          {
            id: 'grp-1-1-2',
            name: 'Кефир',
            metrics: { revenue: 1400, margin: 210, share: 2.5, lfl: 4.2 },
            children: [
              { id: 'sku-4', name: 'Био-кефир 1% 0.5л', metrics: { revenue: 280, margin: 42, share: 0.5, lfl: 5.1 } },
            ],
          },
        ],
      },
      {
        id: 'sub-1-2',
        name: 'Сыр',
        metrics: { revenue: 3900, margin: 585, share: 7.0, lfl: 1.5 },
        children: [
          {
            id: 'grp-1-2-1',
            name: 'Сыры твёрдые',
            metrics: { revenue: 2100, margin: 315, share: 3.8, lfl: 0.8 },
            children: [
              { id: 'sku-5', name: 'Российский 45% 200г', metrics: { revenue: 520, margin: 78, share: 0.9, lfl: -1.2 } },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cat-2',
    name: 'Хлеб и выпечка',
    metrics: { revenue: 8900, margin: 1335, share: 16.0, lfl: -0.5 },
    children: [
      {
        id: 'sub-2-1',
        name: 'Хлеб белый',
        metrics: { revenue: 3200, margin: 480, share: 5.8, lfl: -1.2 },
        children: [
          { id: 'sku-6', name: 'Бородинский 0.4кг', metrics: { revenue: 180, margin: 27, share: 0.3, lfl: 0.4 } },
        ],
      },
    ],
  },
]

function formatNum(n: number, decimals = 1): string {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

interface RowProps {
  node: HierarchyNode
  level: number
  isExpanded: boolean
  onToggle: () => void
  hasChildren: boolean
}

function ReportRow({ node, level, isExpanded, onToggle, hasChildren }: RowProps) {
  const { name, metrics } = node

  return (
    <tr className="hover:bg-gray-50/50 border-b border-gray-100">
      <td className="p-2 align-middle border-r border-gray-100" style={{ paddingLeft: `${12 + level * 20}px` }}>
        <div className="flex items-center gap-1">
          {hasChildren ? (
            <button
              onClick={onToggle}
              className="p-0.5 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
              aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
            >
              {isExpanded ? (
                <Minus className="w-4 h-4 text-gray-600" />
              ) : (
                <Plus className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <span className="w-5 inline-block" />
          )}
          <span className="font-medium text-gray-900 text-sm">{name}</span>
        </div>
      </td>
      <td className="p-2 text-right text-sm text-gray-700 border-r border-gray-100">
        {formatNum(metrics.revenue, 0)} млн
      </td>
      <td className="p-2 text-right text-sm text-gray-700 border-r border-gray-100">
        {formatNum(metrics.margin, 0)} млн
      </td>
      <td className="p-2 text-right text-sm text-gray-700 border-r border-gray-100">
        {formatNum(metrics.share, 1)}%
      </td>
      <td className="p-2 text-right text-sm">
        <span className={metrics.lfl >= 0 ? 'text-green-600' : 'text-red-600'}>
          {metrics.lfl >= 0 ? '+' : ''}{formatNum(metrics.lfl, 1)}%
        </span>
      </td>
    </tr>
  )
}

interface TreeNodeProps {
  node: HierarchyNode
  level: number
  expandedIds: Set<string>
  onToggle: (id: string) => void
}

function TreeNode({ node, level, expandedIds, onToggle }: TreeNodeProps) {
  const hasChildren = Boolean(node.children?.length)
  const isExpanded = expandedIds.has(node.id)

  return (
    <>
      <ReportRow
        node={node}
        level={level}
        isExpanded={isExpanded}
        onToggle={() => onToggle(node.id)}
        hasChildren={hasChildren}
      />
      {hasChildren && isExpanded &&
        node.children!.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            level={level + 1}
            expandedIds={expandedIds}
            onToggle={onToggle}
          />
        ))}
    </>
  )
}

export default function UniversalReport() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Универсальный отчёт — основные показатели</h3>
        <p className="text-sm text-gray-600 mt-1">
          Сводная таблица по уровням товарного классификатора. Нажмите на плюс для раскрытия следующего уровня.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-900 border-r border-gray-200">
                Уровень классификатора
              </th>
              <th className="text-right p-3 font-semibold text-gray-900 border-r border-gray-200 w-28">
                Выручка
              </th>
              <th className="text-right p-3 font-semibold text-gray-900 border-r border-gray-200 w-28">
                Маржа
              </th>
              <th className="text-right p-3 font-semibold text-gray-900 border-r border-gray-200 w-24">
                Доля, %
              </th>
              <th className="text-right p-3 font-semibold text-gray-900 w-24">
                LFL, %
              </th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_DATA.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                expandedIds={expandedIds}
                onToggle={toggle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
