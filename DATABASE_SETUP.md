# 🗄️ Настройка базы данных

## 📋 Обзор

Этот документ описывает настройку базы данных для приложения календаря-планера. Мы используем:
- **PostgreSQL** (через Neon) как основную базу данных
- **Drizzle ORM** для работы с базой данных
- **Drizzle Kit** для миграций

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# База данных
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT токены (измените в продакшене!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Окружение
NODE_ENV="development"
```

### 3. Применение миграций

```bash
# Применить схему к базе данных
npm run db:push

# Или запустить миграции вручную
npm run db:migrate migrate
```

### 4. Запуск приложения

```bash
# Режим разработки
npm run dev

# Продакшн
npm run build
npm start
```

## 🛠️ Команды для работы с базой данных

### Основные команды

```bash
# Применить изменения схемы к базе данных
npm run db:push

# Сгенерировать новую миграцию
npm run db:generate

# Запустить миграции
npm run db:migrate migrate

# Открыть Drizzle Studio (веб-интерфейс для БД)
npm run db:studio
```

### Дополнительные команды

```bash
# Сбросить базу данных (ОПАСНО!)
npm run db:migrate reset

# Проверить статус миграций
npm run db:migrate status
```

## 📊 Структура базы данных

### Таблицы

1. **users** - Пользователи системы
   - `id` (UUID) - уникальный идентификатор
   - `email` (VARCHAR) - email пользователя (уникальный)
   - `phone` (VARCHAR) - номер телефона (опционально)
   - `name` (VARCHAR) - имя пользователя
   - `password_hash` (VARCHAR) - хеш пароля
   - `email_verified` (BOOLEAN) - подтвержден ли email
   - `created_at` (TIMESTAMP) - дата создания
   - `updated_at` (TIMESTAMP) - дата обновления

2. **tasks** - Задачи пользователей
   - `id` (UUID) - уникальный идентификатор
   - `title` (VARCHAR) - название задачи
   - `description` (TEXT) - описание задачи
   - `due_date` (TIMESTAMP) - срок выполнения
   - `completed` (BOOLEAN) - выполнена ли задача
   - `priority` (INTEGER) - приоритет (1-3)
   - `user_id` (UUID) - ID пользователя (FK)
   - `created_at` (TIMESTAMP) - дата создания
   - `updated_at` (TIMESTAMP) - дата обновления

3. **events** - События календаря
   - `id` (UUID) - уникальный идентификатор
   - `title` (VARCHAR) - название события
   - `location` (VARCHAR) - место проведения
   - `date` (DATE) - дата события
   - `time` (VARCHAR) - время начала (HH:MM)
   - `end_time` (VARCHAR) - время окончания (HH:MM)
   - `category` (VARCHAR) - категория события
   - `all_day` (BOOLEAN) - событие на весь день
   - `user_id` (UUID) - ID пользователя (FK)
   - `created_at` (TIMESTAMP) - дата создания

4. **wellbeing_data** - Данные о самочувствии
   - `id` (UUID) - уникальный идентификатор
   - `user_id` (UUID) - ID пользователя (FK)
   - `date` (DATE) - дата записи
   - `water_intake` (INTEGER) - потребление воды (мл)
   - `sleep_hours` (INTEGER) - часы сна
   - `mood` (VARCHAR) - настроение
   - `activity` (VARCHAR) - активность
   - `created_at` (TIMESTAMP) - дата создания

5. **periods** - Данные о циклах (для будущего функционала)
   - `id` (UUID) - уникальный идентификатор
   - `user_id` (UUID) - ID пользователя (FK)
   - `date_start` (DATE) - дата начала
   - `date_end` (DATE) - дата окончания
   - `cycle_length` (INTEGER) - длина цикла
   - `created_at` (TIMESTAMP) - дата создания

6. **user_tasks** - Связь многие-ко-многим между пользователями и задачами
   - `user_id` (UUID) - ID пользователя (FK)
   - `task_id` (UUID) - ID задачи (FK)

### Индексы

Для оптимизации производительности созданы следующие индексы:

- `email_idx` на `users.email`
- `phone_idx` на `users.phone`
- `user_id_idx` на `tasks.user_id`
- `due_date_idx` на `tasks.due_date`
- `completed_idx` на `tasks.completed`
- `events_user_id_idx` на `events.user_id`
- `events_date_idx` на `events.date`
- `wellbeing_user_id_idx` на `wellbeing_data.user_id`
- `wellbeing_date_idx` на `wellbeing_data.date`
- `periods_user_id_idx` на `periods.user_id`
- `date_range_idx` на `periods.date_start, periods.date_end`

## 🔐 Безопасность

### Пароли
- Пароли хешируются с помощью bcrypt с 12 раундами соли
- Минимальная длина пароля: 8 символов
- Требования к паролю: строчные, заглавные буквы, цифры, спецсимволы

### JWT токены
- Access токены действительны 15 минут
- Refresh токены действительны 7 дней
- Токены хранятся в HTTP-only cookies
- Используются разные секреты для access и refresh токенов

### Валидация данных
- Все входные данные валидируются с помощью Zod
- SQL инъекции предотвращаются через параметризованные запросы Drizzle ORM
- Rate limiting для endpoints аутентификации

## 🚨 Важные замечания

### Продакшн
1. **Обязательно** измените JWT секреты в продакшене
2. Используйте HTTPS в продакшене
3. Настройте правильные CORS настройки
4. Используйте переменные окружения для всех секретов

### Разработка
1. Drizzle Studio доступен по адресу `http://localhost:4983`
2. Логи запросов выводятся в консоль
3. В режиме разработки включен hot reload

## 🔧 Устранение неполадок

### Ошибка подключения к базе данных
```bash
# Проверьте DATABASE_URL в .env файле
echo $DATABASE_URL

# Проверьте доступность базы данных
npm run db:studio
```

### Ошибки миграций
```bash
# Сбросить базу данных (только для разработки!)
npm run db:migrate reset

# Применить схему заново
npm run db:push
```

### Проблемы с аутентификацией
1. Проверьте JWT_SECRET и JWT_REFRESH_SECRET
2. Убедитесь, что cookie-parser подключен
3. Проверьте настройки CORS

## 📚 Полезные ссылки

- [Drizzle ORM документация](https://orm.drizzle.team/)
- [Drizzle Kit документация](https://orm.drizzle.team/kit-docs/)
- [Neon PostgreSQL](https://neon.tech/)
- [JWT.io](https://jwt.io/) 