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

## Настройка переменных окружения

1. Скопируйте файл `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Отредактируйте `.env` и установите пароль для доступа к приложению:
```
VITE_APP_PASSWORD=ваш_пароль
```

**Важно:** В Vite переменные окружения для клиентского кода должны начинаться с префикса `VITE_`.

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

**Настройка переменных окружения в Vercel:**
1. Перейдите в настройки проекта на Vercel
2. Откройте раздел "Environment Variables"
3. Добавьте переменную:
   - **Key:** `VITE_APP_PASSWORD`
   - **Value:** ваш пароль для доступа к приложению
4. Выберите окружения (Production, Preview, Development) где должна быть доступна переменная
5. После добавления переменной перезапустите деплой

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