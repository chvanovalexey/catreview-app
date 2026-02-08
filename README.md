# Category Review Demo App

Веб-приложение для системы категорийного ревью торговой сети Дикси.

## Технологии

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- Lucide React

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

## Сборка

```bash
npm run build
```

## Деплой

Приложение готово к деплою на:
- Vercel (рекомендуется)
- Netlify
- GitHub Pages
- Cloudflare Pages

### Деплой на Vercel

1. Установите Vercel CLI: `npm i -g vercel`
2. Выполните: `vercel --prod`

Или подключите репозиторий GitHub к Vercel для автоматического деплоя.

## Структура проекта

- `src/components/` - React компоненты
- `src/data/` - JSON данные (комментарии, задачи, рекомендации ИИ)
- `src/hooks/` - Custom hooks
- `src/store/` - Zustand store
- `src/types/` - TypeScript типы
- `src/utils/` - Утилиты
- `public/reports/` - Изображения отчётов

## Функциональность

- Матрица 5x4 с отчётами по категориям
- Просмотр отчётов с комментариями и задачами
- ИИ-агент с рекомендациями и чатом
- Панель задач менеджера с фильтрацией и статистикой