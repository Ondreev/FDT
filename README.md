# Система управления ресторанами для Food Delivery App

## Обзор

Проект был модернизирован для поддержки управления несколькими ресторанами из единого интерфейса. Теперь все настройки для разных ресторанов управляются централизованно через файлы конфигурации и Google таблицы.

## Новые возможности

### 🏪 Мультиресторанная архитектура
- Поддержка неограниченного количества ресторанов
- Централизованное управление настройками
- Переключение между ресторанами в реальном времени
- Уникальные настройки для каждого ресторана

### 📊 Интеграция с Google таблицами
- Все настройки хранятся в Google Sheets
- Автоматическая синхронизация изменений
- Кэширование для быстродействия
- Возможность редактирования напрямую в таблице

### ⚙️ Административная панель
- Удобный интерфейс для настройки ресторанов
- Разделение настроек по категориям
- Предварительный просмотр изменений
- Валидация данных

## Архитектура

### Файловая структура

```
src/
├── config/
│   ├── restaurantConfig.js          # Основная конфигурация ресторанов
│   └── googleSheetsIntegration.js   # Интеграция с Google Sheets
├── components/
│   ├── RestaurantSelector.jsx       # Компонент выбора ресторана
│   └── RestaurantConfigAdmin.jsx    # Административная панель
└── config.js                       # Обратная совместимость
```

### Ключевые компоненты

#### 1. RestaurantConfigManager
Основной класс для управления конфигурацией:

```javascript
import { restaurantConfig } from './config';

// Получить текущую конфигурацию
const config = restaurantConfig.getCurrentConfig();

// Переключить ресторан
restaurantConfig.setCurrentRestaurant('restaurant2');

// Загрузить настройки из Google таблицы
const settings = await restaurantConfig.loadGoogleSheetsConfig();
```

#### 2. GoogleSheetsIntegration
Класс для работы с Google таблицами:

```javascript
import { googleSheetsIntegration } from './config/googleSheetsIntegration';

// Получить настройки ресторана
const settings = await googleSheetsIntegration.getRestaurantSettings('restaurant1');

// Сохранить настройки
await googleSheetsIntegration.saveRestaurantSettings('restaurant1', newSettings);
```

## Настройка новых ресторанов

### 1. Локальная конфигурация

Добавьте новый ресторан в `src/config/restaurantConfig.js`:

```javascript
export const RESTAURANT_CONFIGS = {
  // ... существующие рестораны
  
  newRestaurant: {
    id: 'newRestaurant',
    name: 'Новый ресторан',
    appName: 'Новый ресторан - Доставка',
    
    // Визуальные настройки
    primaryColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
    font: 'Roboto',
    currency: '₽',
    
    // Настройки доставки
    delivery: {
      threshold: 1800,
      cost: 180,
      freeDeliveryText: 'Бесплатная доставка от 1800 ₽'
    },
    
    // Контактная информация
    contact: {
      phone: '+7 (999) 000-00-00',
      address: 'ул. Новая, 1',
      workingHours: 'Ежедневно с 09:00 до 24:00'
    }
  }
};
```

### 2. Google таблица

Создайте новые листы в Google таблице для нового ресторана:

- `RestaurantSettings_newRestaurant` - настройки ресторана
- `Products_newRestaurant` - товары
- `Categories_newRestaurant` - категории
- `Orders_newRestaurant` - заказы

### 3. Google Apps Script

Обновите скрипт для поддержки нового ресторана:

```javascript
function getRestaurantSettings() {
  const restaurantId = getParameter('restaurantId');
  const sheetName = `RestaurantSettings_${restaurantId}`;
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Логика чтения настроек
    // ...
  } catch (error) {
    console.error('Error getting restaurant settings:', error);
    return ContentService.createTextOutput(JSON.stringify({}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Использование

### Переключение ресторанов

1. **URL параметр**: `https://yourapp.com?restaurant=restaurant2`
2. **Селектор в интерфейсе**: Используйте компонент `RestaurantSelector`
3. **Программно**: `restaurantConfig.setCurrentRestaurant('restaurant2')`

### Административная панель

1. Нажмите на кнопку ⚙️ в правом верхнем углу
2. Выберите нужный ресторан
3. Настройте параметры по вкладкам:
   - 🏪 **Основные** - название, логотип
   - 🎨 **Внешний вид** - цвета, шрифты
   - 🚚 **Доставка** - стоимость, пороги
   - 📞 **Контакты** - телефон, адрес
   - ⚙️ **Дополнительно** - маркеры товаров

### API методы

```javascript
// Получить конфигурацию компонента
const deliveryConfig = restaurantConfig.getComponentConfig('delivery');
const visualConfig = restaurantConfig.getComponentConfig('visual');

// Получить API URL для ресторана
const apiUrl = restaurantConfig.getApiUrl('getProducts');

// Получить список доступных ресторанов
const restaurants = restaurantConfig.getAvailableRestaurants();
```

## Миграция с предыдущей версии

Старые настройки автоматически поддерживаются через систему обратной совместимости. Файл `config.js` теперь импортирует новую систему.

### Что изменилось:
- `settings` теперь загружается с учетом текущего ресторана
- `API_URL` остается тем же, но теперь включает `restaurantId`
- Все компоненты автоматически используют настройки текущего ресторана

### Что нужно обновить:
- Обновите Google Apps Script для поддержки `restaurantId`
- Создайте отдельные листы для каждого ресторана
- Настройте конфигурации в `restaurantConfig.js`

## Структура Google таблицы

```
Google Spreadsheet:
├── RestaurantSettings_restaurant1    # Настройки ресторана 1
├── RestaurantSettings_restaurant2    # Настройки ресторана 2
├── Products_restaurant1              # Товары ресторана 1
├── Products_restaurant2              # Товары ресторана 2
├── Categories_restaurant1            # Категории ресторана 1
├── Categories_restaurant2            # Категории ресторана 2
├── Orders_restaurant1                # Заказы ресторана 1
├── Orders_restaurant2                # Заказы ресторана 2
└── RestaurantsList                   # Список всех ресторанов
```

## Кэширование

Система использует умное кэширование:
- Настройки кэшируются на 5 минут
- Автоматическое обновление при изменениях
- Очистка кэша при переключении ресторанов

## Безопасность

- Все запросы включают временные метки
- Валидация данных на клиенте и сервере
- Защита от несанкционированного доступа к настройкам других ресторанов

## Производительность

- Параллельная загрузка данных
- Ленивая загрузка неиспользуемых ресторанов
- Оптимизированные запросы к Google Sheets
- Минимальные перерисовки интерфейса

## Поддержка

При возникновении проблем:
1. Проверьте консоль браузера на ошибки
2. Убедитесь в правильности настройки Google Apps Script
3. Проверьте структуру Google таблицы
4. Используйте метод `testConnection()` для диагностики

---

*Система создана для максимальной гибкости и простоты использования. Все настройки централизованы и могут быть изменены без перезапуска приложения.*