# 🔐 API Документация - Аутентификация

## 📋 Обзор

Полная система аутентификации с JWT токенами, включающая регистрацию, логин, refresh токены, защищенные endpoints и управление профилем.

## 🚀 Endpoints

### 1. **Регистрация пользователя**
- **URL:** `POST /api/auth/register`
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
- **URL:** `POST /api/auth/login`
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
- **URL:** `POST /api/auth/refresh`
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

### 4. **Проверка токена**
- **URL:** `POST /api/auth/verify`
- **Описание:** Проверка валидности access token
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "token": "eyJ..."
}
```
- **Ответ:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "token": {
      "valid": true,
      "expiresAt": "2025-01-06T20:30:00.000Z",
      "issuedAt": "2025-01-06T20:15:00.000Z"
    },
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

### 5. **Получение профиля** (защищенный)
- **URL:** `GET /api/auth/profile`
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

### 6. **Обновление профиля** (защищенный)
- **URL:** `PUT /api/auth/update-profile`
- **Описание:** Обновление данных профиля
- **Headers:** 
  - `Authorization: Bearer eyJ...`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "name": "Новое Имя",
  "phone": "+9876543210"
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

### 7. **Смена пароля** (защищенный)
- **URL:** `PUT /api/auth/change-password`
- **Описание:** Изменение пароля пользователя
- **Headers:** 
  - `Authorization: Bearer eyJ...`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "currentPassword": "СтарыйПароль123!",
  "newPassword": "НовыйПароль456!"
}
```
- **Ответ:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "message": "Password has been updated"
  }
}
```

### 8. **Выход из системы** (защищенный)
- **URL:** `POST /api/auth/logout`
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

1. **Register User** - POST `/api/auth/register`
2. **Login User** - POST `/api/auth/login`
3. **Refresh Token** - POST `/api/auth/refresh`
4. **Verify Token** - POST `/api/auth/verify`
5. **Get Profile** - GET `/api/auth/profile`
6. **Update Profile** - PUT `/api/auth/update-profile`
7. **Change Password** - PUT `/api/auth/change-password`
8. **Logout** - POST `/api/auth/logout`

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
