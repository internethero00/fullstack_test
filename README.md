# Item Selector

Fullstack-приложение для работы со списком из 1 000 000 элементов — выбор, сортировка drag & drop, фильтрация с infinite scroll.

## Демо

🔗 [https://fullstack-test-doww.onrender.com](https://fullstack-test-doww.onrender.com)

> На бесплатном плане Render сервис засыпает после 15 минут неактивности. Первый запрос после «сна» может занять 30–50 секунд (инициализация 1М элементов).

## Стек

- **Бэкенд:** Express.js, TypeScript, in-memory хранилище
- **Фронтенд:** React, TypeScript, Vite, dnd-kit


### Два окна

- **Левое** — все элементы, кроме выбранных. Фильтрация, infinite scroll, добавление новых ID.
- **Правое** — выбранные элементы. Фильтрация, infinite scroll, сортировка drag & drop.

### Очередь запросов (Request Queue)

Все мутации на фронте проходят через очередь с батчингом и дедупликацией:
- Добавление новых элементов — батч раз в 10 секунд
- Select / deselect — батч раз в 1 секунду
- Дедупликация через `Set` — одно и то же значение не будет отправлено повторно

### Хранение состояния

Выбранные элементы и их порядок хранятся на сервере (in-memory). При обновлении страницы состояние сохраняется. Фильтры не сохраняются — это клиентское состояние.

## Структура проекта

```
├── server/          — Express.js бэкенд
│   └── src/
│       ├── index.ts         — точка входа, мидлвары, статика
│       ├── store.ts         — in-memory хранилище, бизнес-логика
│       └── routes/
│           ├── items.ts     — GET /api/items, POST /api/items/batch
│           └── selected.ts  — GET/POST/DELETE /api/selected, PUT reorder
│
├── client/          — React SPA (Vite)
│   └── src/
│       ├── App.tsx              — корневой компонент
│       ├── api.ts               — fetch-обёртки для API
│       ├── requestQueue.ts      — очередь с батчингом и дедупликацией
│       ├── useInfiniteList.ts   — хук: пагинация, фильтр, debounce
│       └── components/
│           ├── InfiniteScroll.tsx — scroll-контейнер с подгрузкой
│           ├── LeftPanel.tsx      — все элементы + добавление
│           ├── RightPanel.tsx     — выбранные + Drag & Drop
│           └── SortableItem.tsx   — D&D элемент (dnd-kit)
```

## Быстрый старт

```bash
# Клонировать
git clone https://github.com/internethero00/fullstack_test.git
cd fullstack_test

# Сервер
cd server
npm install
npm run dev          # http://localhost:3001

# Клиент (в отдельном терминале)
cd client
npm install
echo "VITE_API_URL=http://localhost:3001" > .env
npm run dev          # http://localhost:5173
```

## Деплой (Render.com)

- **Build Command:** `cd client && npm install && npm run build && cd ../server && npm install && npx tsc`
- **Start Command:** `cd server && node dist/index.js`
- **Instance Type:** Free

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/items?page=1&filter=42` | Невыбранные элементы (пагинация, фильтр по подстроке) |
| POST | `/api/items/batch` | Добавить новые ID `{ ids: [5001, 5002] }` |
| GET | `/api/selected?page=1&filter=42` | Выбранные элементы в порядке D&D |
| POST | `/api/selected/batch` | Выбрать элементы `{ ids: [42, 77] }` |
| DELETE | `/api/selected/batch` | Убрать из выбранных `{ ids: [42] }` |
| PUT | `/api/selected/reorder` | Переместить элемент `{ itemId: 1042, beforeId: 42 }` |
| GET | `/api/health` | Проверка работоспособности |