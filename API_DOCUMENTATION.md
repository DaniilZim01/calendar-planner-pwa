# 🔐 API Документация - Аутентификация

## 📋 Обзор

Полная система аутентификации с JWT токенами, включающая регистрацию, логин, refresh токены, защищенные endpoints и управление профилем.

## 🚀 Endpoints

Важно: для соблюдения лимита серверлес‑функций объединены обновление профиля и смена пароля в один эндпоинт `PUT /api/auth/profile`. Эндпоинт `POST /api/auth/verify` удалён (его функцию выполняет `GET /api/auth/profile`). Для обратной совместимости настроены rewrites.

### 1. **Регистрация пользователя**
- URL: `POST /api/auth/register`
- **Описание:** Создание нового пользователя
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "Имя Пользователя",
  "phone": "+1234567890" // опционально
}
```
- **Ответ:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Имя Пользователя",
      "phone": "+1234567890",
      "emailVerified": false
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### 2. **Вход в систему**
- URL: `POST /api/auth/login`
- **Описание:** Аутентификация пользователя
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
- **Ответ:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Имя Пользователя",
      "phone": "+1234567890",
      "emailVerified": false
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### 3. **Обновление токенов**
- URL: `POST /api/auth/refresh`
- **Описание:** Обновление access token с помощью refresh token
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "refreshToken": "eyJ..."
}
```
- **Ответ:**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Имя Пользователя"
    }
  }
}
```

### 4. Удалено: Проверка токена
- Вместо `POST /api/auth/verify` используйте `GET /api/auth/profile`. Успешный ответ (200) означает валидный токен; 401/403 — невалидный/истёкший.

### 5. **Получение профиля** (защищенный)
- URL: `GET /api/auth/profile`
- **Описание:** Получение данных профиля пользователя
- **Headers:** 
  - `Authorization: Bearer eyJ...`
  - `Content-Type: application/json`
- **Ответ:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Имя Пользователя",
      "phone": "+1234567890",
      "emailVerified": false,
      "createdAt": "2025-01-06T20:15:00.000Z",
      "updatedAt": "2025-01-06T20:15:00.000Z"
    }
  }
}
```

### 6. **Обновление профиля / Смена пароля** (защищенный)
- URL: `PUT /api/auth/profile`
- **Описание:** Обновление имени/телефона, а также смена пароля (если передан `newPassword`, обязателен `currentPassword`).
- **Headers:** 
  - `Authorization: Bearer eyJ...`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "name": "Новое Имя",               // опционально
  "phone": "+9876543210",           // опционально (null — очистить)
  "currentPassword": "СтарыйПароль123!", // обязателен, если указан newPassword
  "newPassword": "НовыйПароль456!"       // опционально; >= 8 символов, верхний/нижний регистр и цифра
}
```
- **Ответ:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Новое Имя",
      "phone": "+9876543210",
      "emailVerified": false,
      "createdAt": "2025-01-06T20:15:00.000Z",
      "updatedAt": "2025-01-06T20:20:00.000Z"
    }
  }
}
```

### 7. Объединено в п.6
- Смена пароля выполняется через `PUT /api/auth/profile`.

### 8. **Выход из системы** (защищенный)
- URL: `POST /api/auth/logout`
- **Описание:** Выход пользователя из системы
- **Headers:** 
  - `Authorization: Bearer eyJ...`
  - `Content-Type: application/json`
- **Ответ:**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "message": "User logged out successfully"
  }
}
```

## 🔒 Безопасность

### **JWT Токены**
- **Access Token:** 15 минут
- **Refresh Token:** 7 дней
- **Алгоритм:** HS256
- **Секреты:** Настраиваются через переменные окружения

### **Валидация паролей**
- Минимум 8 символов
- Содержит строчные и заглавные буквы
- Содержит цифры

### **Защищенные Endpoints**
Все защищенные endpoints требуют валидный access token в заголовке:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Коды ответов

- **200:** Успешный запрос
- **201:** Ресурс создан (регистрация)
- **400:** Неверные данные запроса
- **401:** Не авторизован (нет токена или токен истек)
- **403:** Доступ запрещен (неверный токен)
- **404:** Ресурс не найден
- **405:** Метод не разрешен
- **409:** Конфликт (пользователь уже существует)
- **500:** Внутренняя ошибка сервера

## 🧪 Тестирование

### **Postman Collection**
Создайте коллекцию в Postman с следующими запросами:

1. Register User — POST `/api/auth/register`
2. Login User — POST `/api/auth/login`
3. Refresh Token — POST `/api/auth/refresh`
4. Get Profile — GET `/api/auth/profile`
5. Update Profile / Change Password — PUT `/api/auth/profile`
6. Logout — POST `/api/auth/logout`

### Rewrites (Vercel)
Для обратной совместимости настроены перенаправления:
```json
{
  "rewrites": [
    { "source": "/api/auth/update-profile", "destination": "/api/auth/profile" },
    { "source": "/api/auth/change-password", "destination": "/api/auth/profile" },
    { "source": "/api/auth/verify", "destination": "/api/auth/profile" }
  ]
}
```

Рекомендация: при переходе на Pro‑план можно разнести смену пароля и обновление профиля обратно в отдельные функции для меньших бандлов и удобной трассировки логов.

### События

Новые функции событий (в одной/двух серверлес‑функциях):
- GET  `/api/events?from=ISO&to=ISO`
- POST `/api/events`
- PATCH `/api/events/:id`
- DELETE `/api/events/:id`

Body для POST/PATCH: title, description?, startTime(UTC ISO), endTime(UTC ISO), timezone, location?, isAllDay.

#### Примеры

- Получить список (защищено):
  - Headers: `Authorization: Bearer <accessToken>`
  - GET `/api/events?from=2025-01-10T00:00:00.000Z&to=2025-01-20T23:59:59.999Z`

- Создать событие:
  - Headers: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
  - POST `/api/events`
  - Body:
  ```json
  {
    "title": "Встреча",
    "description": "Обсуждение",
    "startTime": "2025-01-12T10:00:00.000Z",
    "endTime": "2025-01-12T11:00:00.000Z",
    "timezone": "Europe/Moscow",
    "location": "Zoom",
    "isAllDay": false
  }
  ```

- Обновить событие:
  - Headers: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
  - PATCH `/api/events/:id`
  - Body (пример):
  ```json
  {
    "title": "Встреча (обновлено)",
    "location": "Skype"
  }
  ```

- Удалить событие:
  - Headers: `Authorization: Bearer <accessToken>`
  - DELETE `/api/events/:id`

Структура ответа `data` для событий:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Встреча",
  "description": "Обсуждение",
  "start_time": "2025-01-12T10:00:00.000Z",
  "end_time": "2025-01-12T11:00:00.000Z",
  "timezone": "Europe/Moscow",
  "location": "Zoom",
  "is_all_day": false,
  "created_at": "2025-01-10T09:00:00.000Z",
  "updated_at": "2025-01-10T09:00:00.000Z"
}
```

### **Переменные окружения**
Настройте переменные в Postman:
- `baseUrl`: `https://calendar-planner-pwa.vercel.app`
- `accessToken`: Получается после логина
- `refreshToken`: Получается после логина

## 🔧 Переменные окружения

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

## 📝 Примечания

- Все пароли хешируются с bcrypt (12 раундов)
- Токены содержат userId, email и name
- Refresh токены используются для получения новых access токенов
- Защищенные endpoints проверяют валидность access токена
- Время жизни токенов настраивается в коде
