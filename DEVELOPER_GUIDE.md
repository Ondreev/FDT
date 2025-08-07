# 🚀 Руководство разработчика - Food Delivery System

## 📋 Обзор системы

Эта система разработана для быстрого развертывания приложений доставки еды для разных клиентов. Основные принципы:

- **Один файл для настройки** - все изменения для нового клиента делаются в `src/config/clientConfig.js`
- **Google Sheets как база данных** - все данные (товары, заказы, настройки) хранятся в Google таблице
- **Минимальные изменения кода** - система адаптируется под клиента через конфигурацию

## ⚡ Быстрый старт (5 минут)

### 1. Настройка Google Apps Script

Ваш Google Apps Script уже готов. URL должен быть в формате:
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 2. Настройка клиента

Откройте файл `src/config/clientConfig.js` и измените:

```javascript
const CLIENT_CONFIG = {
  // Замените на URL вашего Google Apps Script
  apiUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  
  // Название приложения
  appName: 'Название ресторана',
  
  // Локальные настройки (до загрузки из Google Sheets)
  local: {
    theme: {
      primaryColor: '#e74c3c',    // Основной цвет
      secondaryColor: '#2c3e50',  // Дополнительный цвет
      backgroundColor: '#ffffff', // Цвет фона
      textColor: '#333333'        // Цвет текста
    }
  },
  
  // Включенные функции
  features: {
    delivery: true,      // Доставка
    pickup: true,        // Самовывоз
    reviews: true,       // Отзывы
    discounts: true,     // Скидки
    adminPanel: true,    // Админ панель
    printReceipts: true  // Печать чеков
  }
};
```

### 3. Запуск

```bash
npm install
npm run dev
```

**Готово!** Система автоматически подключится к вашей Google таблице и загрузит настройки.

## 📊 Структура Google Sheets

Ваша таблица должна содержать следующие листы:

### 🔧 settings (ключ-значение)
Основные настройки приложения:

| Ключ | Значение | Описание |
|------|----------|----------|
| `businessName` | `Пицца Мама` | Название бизнеса |
| `businessPhone` | `+7 (999) 123-45-67` | Телефон |
| `businessEmail` | `info@pizza.ru` | Email |
| `businessAddress` | `ул. Главная, 1` | Адрес |
| `workingHours` | `10:00-23:00` | Время работы |
| `primaryColor` | `#e74c3c` | Основной цвет |
| `secondaryColor` | `#2c3e50` | Дополнительный цвет |
| `deliveryMinOrder` | `500` | Минимальный заказ для доставки |
| `deliveryFee` | `200` | Стоимость доставки |
| `deliveryFreeFrom` | `2000` | Бесплатная доставка от суммы |
| `deliveryTime` | `30-60 минут` | Время доставки |
| `feature_delivery` | `true` | Включить доставку |
| `feature_pickup` | `true` | Включить самовывоз |

### 🍕 products
Товары с полями: `id`, `name`, `description`, `price`, `category`, `image`, `available`

### 📂 categories  
Категории товаров: `id`, `name`, `description`, `order`

### 💰 discounts
Скидки: `id`, `name`, `percent`, `minOrder`, `active`

### 📋 orders
Заказы: `orderId`, `customerName`, `phone`, `address`, `products`, `total`, `status`, `date`

### 🏷️ statusLabels
Статусы заказов: `status`, `label`, `color`

### 👥 admins
Администраторы: `id`, `name`, `phone`, `role`

### 🖨️ printTemplates
Шаблоны печати: `type`, `template`

### ⭐ reviews
Отзывы: `id`, `customerName`, `rating`, `comment`, `date`

## 🎨 Настройка внешнего вида

### Через Google Sheets (рекомендуется)
Добавьте в лист `settings`:

```
primaryColor     | #ff6b35
secondaryColor   | #2c3e50
backgroundColor  | #f8f9fa
textColor        | #333333
accentColor      | #28a745
errorColor       | #dc3545
successColor     | #28a745
warningColor     | #ffc107
```

### Через локальную конфигурацию
В файле `clientConfig.js`:

```javascript
local: {
  theme: {
    primaryColor: '#ff6b35',
    secondaryColor: '#2c3e50',
    backgroundColor: '#f8f9fa',
    textColor: '#333333'
  }
}
```

## ⚙️ Управление функциями

### Через Google Sheets
Добавьте в лист `settings` ключи с префиксом `feature_`:

```
feature_delivery      | true
feature_pickup        | true
feature_reviews       | false
feature_discounts     | true
feature_adminPanel    | true
feature_printReceipts | false
```

### Через локальную конфигурацию
В файле `clientConfig.js`:

```javascript
features: {
  delivery: true,
  pickup: true,
  reviews: false,
  discounts: true,
  adminPanel: true,
  printReceipts: false
}
```

## 💻 Использование в коде

### Получение настроек
```javascript
import { clientConfig, getConfig, isFeatureEnabled } from './config/clientConfig.js';

// Получить любую настройку
const businessName = getConfig('businessName', 'Food Delivery');
const primaryColor = getConfig('primaryColor', '#e74c3c');

// Проверить включена ли функция
if (isFeatureEnabled('delivery')) {
  // Показать опции доставки
}

// Получить тему
const theme = clientConfig.getTheme();
console.log(theme.primaryColor); // #e74c3c

// Получить настройки бизнеса
const business = clientConfig.getBusiness();
console.log(business.name, business.phone);

// Получить настройки доставки
const delivery = clientConfig.getDelivery();
console.log(delivery.fee, delivery.minOrder);
```

### Работа с данными
```javascript
import { useGoogleSheetsData } from './config/googleSheetsIntegration.js';

// В React компоненте
function ProductList() {
  const { data: products, loading, error } = useGoogleSheetsData('products');
  const { data: categories } = useGoogleSheetsData('categories');
  
  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Создание заказа
```javascript
import { getGoogleSheetsIntegration } from './config/googleSheetsIntegration.js';

async function createOrder(orderData) {
  const sheets = getGoogleSheetsIntegration();
  
  try {
    const result = await sheets.createOrder({
      orderId: Date.now().toString(),
      customerName: orderData.name,
      phone: orderData.phone,
      address: orderData.address,
      products: JSON.stringify(orderData.items),
      total: orderData.total,
      status: 'pending'
    });
    
    console.log('Заказ создан:', result.orderId);
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
  }
}
```

## 🧪 Тестирование

### Безопасное тестирование
1. Откройте `src/config.js`
2. Раскомментируйте строку с тестовой конфигурацией:
```javascript
// Для тестирования раскомментируйте эту строку:
import { clientConfig, config, theme, business, features } from './config/testConfig.js';

// И закомментируйте основную:
// import { clientConfig, config, theme, business, features } from './config/clientConfig.js';
```

3. Измените настройки в `src/config/testConfig.js`
4. Перезапустите приложение
5. После тестирования верните обратно

### Проверка подключения
```javascript
import { clientConfig } from './config/clientConfig.js';

// Проверить подключение к Google Sheets
async function testConnection() {
  const sheets = clientConfig.getGoogleSheets();
  const result = await sheets.testConnection();
  
  if (result.success) {
    console.log('✅ Подключение успешно');
  } else {
    console.error('❌ Ошибка подключения:', result.message);
  }
}
```

## 🚀 Развертывание

### 1. Подготовка
```bash
# Установить зависимости
npm install

# Собрать проект
npm run build
```

### 2. Настройка Google Apps Script
- Убедитесь, что скрипт опубликован как веб-приложение
- Доступ: "Все пользователи"
- Выполнять как: "Я"

### 3. Загрузка на хостинг
```bash
# Загрузить папку dist/ на ваш хостинг
# Настроить домен и HTTPS
```

### 4. Финальная проверка
- ✅ Приложение открывается
- ✅ Данные загружаются из Google Sheets
- ✅ Можно создать тестовый заказ
- ✅ Админ-панель работает (если включена)

## 🔧 Частые проблемы

### Не загружаются данные
1. Проверьте URL Google Apps Script в `clientConfig.js`
2. Убедитесь, что скрипт опубликован как веб-приложение
3. Проверьте консоль браузера на ошибки CORS

### Настройки не применяются
1. Очистите кэш браузера
2. Проверьте названия ключей в листе `settings`
3. Убедитесь, что лист называется именно `settings`

### Заказы не создаются
1. Проверьте структуру листа `orders`
2. Убедитесь, что все обязательные поля присутствуют
3. Проверьте права доступа к Google таблице

## 📞 Поддержка

При возникновении проблем:
1. Проверьте консоль браузера (F12)
2. Убедитесь в правильности настроек Google Apps Script
3. Проверьте структуру Google таблицы
4. Используйте тестовую конфигурацию для отладки

---

## 📝 Чек-лист для нового клиента

- [ ] Создана Google таблица с нужными листами
- [ ] Настроен и опубликован Google Apps Script  
- [ ] Обновлен `apiUrl` в `clientConfig.js`
- [ ] Настроены базовые параметры (название, цвета, функции)
- [ ] Добавлены товары и категории в таблицу
- [ ] Протестировано создание заказа
- [ ] Проверена работа на мобильных устройствах
- [ ] Проект собран и загружен на хостинг
- [ ] Настроен домен и SSL сертификат
- [ ] Обучен персонал работе с системой

**Время развертывания: 15-30 минут** ⚡