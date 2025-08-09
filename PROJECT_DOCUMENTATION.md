## 1. Общее описание проекта

Календарь‑планер (PWA) для ежедневного планирования и отслеживания целей и задач. Основная идея — объединить быстрый «дневной план» (Today) и общий список задач/целей, с удобной мобильной подачей и офлайн‑поддержкой.

- Основные фичи:
  - Today (сегодняшние задачи), All/Week (фильтры)
  - Цели (группировки по типам, минималистичный UI)
  - Аутентификация (JWT), личный профиль
  - Сохранение прогресса и синхронизация через Supabase (PostgreSQL)
  - PWA (иконки, манифест, service worker)


## 2. Архитектура приложения

- Frontend: React + TypeScript, Vite, Wouter (роутинг), React Query (данные), Tailwind CSS (UI), собственные UI компоненты.
- Backend: Vercel Serverless Functions (`/api/**`), Supabase (PostgreSQL + REST SDK), JWT‑аутентификация.
- Общие типы/схемы БД описаны в `server/db/schema.ts` (Drizzle ORM для типизации и миграций).

Пояснения:
- В продакшене API развёрнуто как серверлес‑функции Vercel в каталоге `api/`.
- Отдельный `server/` (Express) сохранён в репозитории для локальной разработки и типизации, но в проде не используется.


## 3. Сущности приложения

- User
  - id UUID
  - email (unique), phone (nullable)
  - name, password_hash
  - email_verified (bool)
  - created_at, updated_at

- Task
  - id UUID
  - title (string), description (text, nullable)
  - due_date (timestamp, nullable)
  - completed (bool, default false)
  - priority (int: 1=low, 2=medium, 3=high)
  - created_at, updated_at

- UserTask (связующая таблица «многие‑ко‑многим» между User и Task)
  - user_id, task_id (PK составной)

- Period (для будущего функционала)
  - id, user_id, date_start, date_end, cycle_length, created_at

- Дополнительно (есть в схеме, не активировано во фронте):
  - Events, WellbeingData

Связи:
- User —< UserTask >— Task
- User —< Period, Events, WellbeingData


## 4. Структура базы данных

- Таблицы (Supabase, схема `public`): `users`, `tasks`, `user_tasks`, `periods`, `events`, `wellbeing_data`.
- Ключи:
  - `users.id` — PK (uuid)
  - `tasks.id` — PK (uuid)
  - `user_tasks.(user_id, task_id)` — составной PK
  - Внешние ключи на `users.id`/`tasks.id` (каскадное удаление)
- Индексы: по частоупотребимым полям (пример: `due_date`, `completed`, `email`).
- Миграции/инициализация: примерная миграция лежит в `server/db/migrations/001_initial.sql`. Для разработки — `npm run db:migrate` (Drizzle).


## 5. API и методы (REST, Vercel functions)

Общий префикс: `/api`

Аутентификация (JWT в Authorization: Bearer <token>):
- POST `/api/auth/register` — регистрация пользователя
- POST `/api/auth/login` — логин
- POST `/api/auth/refresh` — обновить пару токенов (по refreshToken)
- POST `/api/auth/logout` — выход (инвалидация на стороне приложения)
- GET `/api/auth/profile` — получить профиль (защищено)
- PUT `/api/auth/update-profile` — обновить имя/телефон (защищено)
- POST `/api/auth/verify` — проверить валидность access‑токена
- PUT `/api/auth/change-password` — сменить пароль (защищено)

Задачи (все защищено токеном):
- GET `/api/tasks` — список задач пользователя
  - Доппараметры: `?scope=today|week` для фильтрации по дате
- POST `/api/tasks` — создать задачу
  - Body: `{ title: string; description?: string; dueDate?: ISOString; priority?: 1|2|3 }`
- PUT `/api/tasks/:id` — обновить поля задачи
- PATCH `/api/tasks/:id` — переключить `completed`
- DELETE `/api/tasks/:id` — удалить задачу

Особенности реализации:
- Связь пользователя и задач — через `user_tasks`:
  - Чтение: берём `task_id` из `user_tasks` по `user_id`, затем `.in('id', ...)` из `tasks`
  - Создание: запись в `tasks`, затем линк в `user_tasks`
  - Любые обновления/удаления/тоггл — предварительная проверка владения через `user_tasks`

Формат ответа (общий):
```json
{
  "success": true,
  "message": "...",
  "data": { /* полезная нагрузка */ }
}
```
При ошибке: `{ success: false, message, error? }` с корректным HTTP‑статусом.


## 6. Логика фронтенда

- Страницы: `today/planner`, `goals`, `calendar`, `wellbeing`, `profile`, `auth`, `not-found`
- Роутинг: Wouter (`client/src/App.tsx`), `/profile` защищён через `ProtectedRoute`
- Данные и кеш: React Query
  - `client/src/lib/api.ts` — axios‑клиент, interceptors, авторизация, авто‑рефреш токенов
  - `client/src/lib/hooks.ts` — хуки (auth, profile, tasks), оптимистичные апдейты для toggle/create
- UI:
  - Today: вкладки «Сегодня / Неделя / Все», список задач (`TaskList`), форма (`TaskForm`)
  - Цели (goals): пока локальная демо‑логика; будет переключено на серверные задачи (единая сущность)
  - Профиль: данные из `/api/auth/profile`, обновление имени/телефона
- PWA: `client/public/manifest.json`, `client/public/service-worker.js`


## 7. Аутентификация и безопасность

- JWT (access + refresh), секрета в ENV: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Авторизация: `Authorization: Bearer <accessToken>`
- Middleware `api/auth/middleware.js` проверяет токен, пробрасывает `req.user`
- Базовая валидация входных данных в обработчиках
- CORS — по умолчанию Vercel для публичных функций; на клиенте — только свой origin


## 8. Логика работы приложения

- Создание задачи: POST `/api/tasks` => запись в `tasks` + линк в `user_tasks` => фронт сразу показывает задачу (оптимистично)
- Переключение выполненности: PATCH `/api/tasks/:id` => инверсия `completed` => фронт мгновенно меняет чекбокс
- Фильтры:
  - Today — `due_date` в рамках текущего дня (UTC‑границы)
  - Week — диапазон понедельник…воскресенье (UTC)
- Цели = те же задачи; Today отображает подмножество по дате


## 9. Тестирование

- Юнит/интеграционные тесты пока не добавлены
- Рекомендации (планы):
  - e2e (Playwright/Cypress): happy‑путь логина, CRUD задач, токен‑рефреш
  - unit (Vitest): утилиты дат/форматирования


## 10. Запуск и деплой

Локально:
```bash
npm install

# Dev (локальный сервер + Vite)
npm run dev

# Build (клиент + серверный бандл; сервер в проде не используется)
npm run build

# Prod запуск Node-бандла (локально)
npm run start
```

Переменные окружения (Vercel Project Settings / локально через shell):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- (опционально) `VITE_API_BASE_URL` для клиента; по умолчанию — текущий origin

Vercel:
- `vercel.json` содержит SPA‑rewrite: все пути кроме `/api/**` и статических ассетов → `/index.html`
- Ограничение Hobby: ≤ 12 функций. Мы объединили today/week фильтры в `GET /api/tasks?scope=...`.


## 11. Дополнительное

- Roadmap (кратко):
  - Перенести страницу «Цели» на серверные задачи (единая сущность)
  - Модальные формы задач, быстрые свайпы, фильтры по приоритетам
  - E2E/Unit тесты
  - Улучшенные отчёты/аналитика

- Git Flow (минимум):
  - `main` — прод
  - feature‑ветки (`feature/...`) — для задач, PR → main

- Стили/гайдлайны: Tailwind, минималистичный UI, цветовая схема из `client/src/index.css`


