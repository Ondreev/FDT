# 🧪 Инструкция по безопасному тестированию

## 🚀 Быстрое тестирование (30 секунд)

### 1. Переключение на тестовую конфигурацию
Откройте файл `src/config.js` и измените импорт:

```javascript
// Закомментируйте основную конфигурацию:
// import { clientConfig, config, theme, business, features } from './config/clientConfig.js';

// Раскомментируйте тестовую:
import { clientConfig, config, theme, business, features } from './config/testConfig.js';
```

### 2. Перезапустите приложение
```bash
npm run dev
```

### 3. Проверьте изменения
- Фиолетовая тема
- Название "Тестовый ресторан"
- Эмодзи маркеры
- Включены все функции

## 🔧 Настройка тестовой конфигурации

Откройте `src/config/testConfig.js` и измените настройки:

```javascript
const TEST_CONFIG = {
  // Ваш тестовый API URL
  apiUrl: 'YOUR_TEST_GOOGLE_APPS_SCRIPT_URL',
  
  // Тестовое название
  appName: 'Тестовый ресторан',
  
  // Тестовая тема
  local: {
    theme: {
      primaryColor: '#9b59b6',     // Фиолетовый
      secondaryColor: '#34495e',   // Темно-синий
      backgroundColor: '#f8f9fa',  // Светло-серый
      textColor: '#2c3e50'         // Темный текст
    }
  },
  
  // Тестовые функции (включите все для полного тестирования)
  features: {
    delivery: true,
    pickup: true,
    reviews: true,
    discounts: true,
    adminPanel: true,
    printReceipts: true
  }
};
```

## 🎯 Сценарии тестирования

### Тест 1: Проверка темы
1. Измените `primaryColor` на `#e74c3c` (красный)
2. Перезагрузите страницу
3. Убедитесь, что кнопки стали красными

### Тест 2: Проверка функций
1. Установите `delivery: false`
2. Перезагрузите страницу
3. Убедитесь, что опция доставки исчезла

### Тест 3: Проверка Google Sheets
1. Установите правильный `apiUrl`
2. Откройте консоль браузера (F12)
3. Найдите сообщение "✅ Client Config initialized successfully"

### Тест 4: Проверка настроек из Google Sheets
1. Добавьте в лист `settings` вашей таблицы:
   ```
   businessName | Тестовая пиццерия
   primaryColor | #ff6b35
   ```
2. Перезагрузите страницу
3. Настройки из Google Sheets должны переопределить локальные

## 🔍 Отладка

### Проверка подключения к Google Sheets
Откройте консоль браузера и выполните:

```javascript
// Проверить статус инициализации
console.log('Готов:', clientConfig.isReady());

// Проверить загруженные настройки
console.log('Все настройки:', clientConfig.getAll());

// Проверить подключение
clientConfig.getGoogleSheets().testConnection()
  .then(result => console.log('Подключение:', result));
```

### Проверка настроек
```javascript
// Проверить конкретную настройку
console.log('Название бизнеса:', clientConfig.get('businessName'));

// Проверить тему
console.log('Тема:', clientConfig.getTheme());

// Проверить функции
console.log('Доставка включена:', clientConfig.isFeatureEnabled('delivery'));
```

### Очистка кэша
```javascript
// Очистить кэш Google Sheets
clientConfig.getGoogleSheets().clearCache();

// Обновить настройки
clientConfig.refreshSettings();
```

## ⚠️ Важные правила безопасности

### ✅ Можно делать:
- Изменять `src/config/testConfig.js`
- Переключаться между конфигурациями в `src/config.js`
- Тестировать любые настройки

### ❌ Нельзя делать:
- Изменять `src/config/clientConfig.js` во время тестирования
- Коммитить изменения в `src/config.js` (только для локального тестирования)
- Удалять файлы конфигурации

## 🔄 Возврат к рабочей конфигурации

После тестирования обязательно верните настройки:

1. Откройте `src/config.js`
2. Верните импорт:
```javascript
// Основная конфигурация:
import { clientConfig, config, theme, business, features } from './config/clientConfig.js';

// Тестовая (закомментировано):
// import { clientConfig, config, theme, business, features } from './config/testConfig.js';
```
3. Перезапустите приложение

## 🎨 Готовые тестовые сценарии

### Сценарий "Пиццерия"
```javascript
const TEST_CONFIG = {
  apiUrl: 'YOUR_API_URL',
  appName: 'Пицца Тест',
  local: {
    theme: {
      primaryColor: '#ff7f32',
      secondaryColor: '#2c3e50',
      backgroundColor: '#fdf0e2',
      textColor: '#2c1e0f'
    }
  }
};
```

### Сценарий "Суши"
```javascript
const TEST_CONFIG = {
  apiUrl: 'YOUR_API_URL',
  appName: 'Суши Тест',
  local: {
    theme: {
      primaryColor: '#3498db',
      secondaryColor: '#2c3e50',
      backgroundColor: '#e8f4fd',
      textColor: '#1e3a8a'
    }
  }
};
```

### Сценарий "Минимальный функционал"
```javascript
features: {
  delivery: true,
  pickup: false,
  reviews: false,
  discounts: false,
  adminPanel: false,
  printReceipts: false
}
```

## 📊 Проверка результатов

### Визуальная проверка:
- [ ] Изменился цвет кнопок
- [ ] Изменилось название в заголовке
- [ ] Появились/исчезли нужные функции
- [ ] Загрузились данные из Google Sheets

### Техническая проверка:
- [ ] Нет ошибок в консоли
- [ ] Конфигурация инициализировалась успешно
- [ ] API отвечает корректно
- [ ] Кэширование работает

## 🚨 Устранение проблем

### Проблема: Настройки не применяются
**Решение:** Очистите кэш браузера (Ctrl+F5)

### Проблема: Ошибка подключения к API
**Решение:** Проверьте URL Google Apps Script в `testConfig.js`

### Проблема: Не переключается конфигурация
**Решение:** Убедитесь, что правильно изменили импорт в `src/config.js`

---

## ✅ Чек-лист тестирования

- [ ] Переключился на тестовую конфигурацию
- [ ] Проверил изменение темы
- [ ] Проверил включение/отключение функций
- [ ] Протестировал подключение к Google Sheets
- [ ] Проверил загрузку настроек из таблицы
- [ ] Вернулся к рабочей конфигурации
- [ ] Убедился, что основная конфигурация работает

**Время тестирования: 5-10 минут** ⚡