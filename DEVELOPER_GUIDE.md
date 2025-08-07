# 🚀 Руководство разработчика - Настройка под нового заказчика

## 📋 Обзор

Эта система создана для **максимально быстрой** настройки приложения доставки еды под любого нового заказчика. Все настройки централизованы в **одном файле** - больше никаких поисков по коду!

## ⚡ Быстрый старт (5 минут)

### 1. Скопируйте проект
```bash
git clone <this-repo>
cd food-delivery-app
npm install
```

### 2. Настройте клиента
Откройте **единственный файл** для настройки: `src/config/clientConfig.js`

```javascript
// Измените эти настройки под вашего заказчика:
const CLIENT_SETTINGS = {
  business: {
    name: 'Пиццерия "У Джузеппе"',        // ← Название ресторана
    appName: 'Джузеппе Пицца',            // ← Название приложения  
    projectTitle: 'Лучшая пицца в городе' // ← Заголовок на сайте
  },
  
  contact: {
    phone: '+7 (999) 123-45-67',          // ← Телефон для заказов
    address: 'ул. Итальянская, 15'        // ← Адрес ресторана
  },
  
  theme: {
    scheme: 'orange',                      // ← Цветовая схема
    typography: 'casual'                   // ← Стиль шрифтов
  },
  
  delivery: {
    threshold: 1500,                       // ← Сумма для бесплатной доставки
    cost: 150                              // ← Стоимость доставки
  }
};
```

### 3. Готово! 🎉
```bash
npm run dev
```

Приложение автоматически применит все настройки. **Никаких других файлов менять не нужно!**

---

## 🎨 Готовые пресеты

Для еще более быстрого старта используйте готовые пресеты:

```javascript
// В clientConfig.js измените эту строку:
const USE_PRESET = 'pizzeria'; // 'pizzeria', 'sushi', 'burger'
```

### Доступные пресеты:
- **`pizzeria`** - Оранжевая тема, casual шрифты, итальянский стиль
- **`sushi`** - Синяя тема, elegant шрифты, японский стиль  
- **`burger`** - Красная тема, modern шрифты, американский стиль

---

## 🔧 Полная настройка

### 🏢 Информация о бизнесе
```javascript
business: {
  name: 'Название ресторана',
  appName: 'Название приложения', 
  projectTitle: 'Заголовок на сайте',
  logoUrl: 'https://example.com/logo.png', // или null
  description: 'Описание ресторана'
}
```

### 📞 Контакты
```javascript
contact: {
  phone: '+7 (999) 123-45-67',
  email: 'info@restaurant.com',
  address: 'ул. Главная, 1',
  workingHours: 'Ежедневно с 10:00 до 23:00',
  socialMedia: {
    instagram: '@restaurant',
    telegram: '@restaurant_bot'
  }
}
```

### 🎨 Визуальная тема

#### Готовые цветовые схемы:
- **`orange`** - Теплая оранжевая (подходит для пиццы, фаст-фуда)
- **`blue`** - Профессиональная синяя (подходит для суши, морепродуктов)
- **`green`** - Свежая зеленая (подходит для здорового питания)
- **`purple`** - Премиальная фиолетовая (подходит для элитных ресторанов)
- **`red`** - Яркая красная (подходит для бургеров, мяса)

#### Готовые стили шрифтов:
- **`casual`** - Дружелюбные шрифты (Fredoka + Nunito)
- **`professional`** - Деловые шрифты (Roboto + Open Sans)
- **`elegant`** - Элегантные шрифты (Montserrat + Lato)
- **`modern`** - Современные шрифты (Inter + Source Sans Pro)

```javascript
theme: {
  scheme: 'orange',      // Цветовая схема
  typography: 'casual',  // Стиль шрифтов
  
  // Кастомные цвета (необязательно)
  colors: {
    primary: '#ff7f32',    // Основной цвет
    background: '#fdf0e2'  // Цвет фона
  }
}
```

### 🚚 Настройки доставки
```javascript
delivery: {
  enabled: true,                    // Включить доставку
  threshold: 2000,                  // Сумма для бесплатной доставки
  cost: 200,                        // Стоимость доставки
  currency: '₽',                    // Валюта
  estimatedTime: '30-60 минут'      // Время доставки
}
```

### 🏷️ Маркеры товаров
```javascript
products: {
  markers: {
    flash: 'АКЦИЯ',       // Маркер акционных товаров
    hot: 'ОСТРОЕ',        // Маркер острых блюд
    new: 'НОВИНКА',       // Маркер новых товаров
    popular: 'ХИТ',       // Маркер популярных блюд
    spicy: 'ОСТРОЕ',      // Маркер острой еды
    vegetarian: 'ВЕГ'     // Маркер вегетарианских блюд
  }
}
```

### ⚙️ Включение/отключение функций
```javascript
features: {
  // Основные функции
  ENABLE_CART: true,                    // Корзина
  ENABLE_CHECKOUT: true,                // Оформление заказа
  
  // Доставка
  ENABLE_DELIVERY: true,                // Доставка
  ENABLE_PICKUP: true,                  // Самовывоз
  
  // Платежи  
  ENABLE_CASH_PAYMENT: true,            // Оплата наличными
  ENABLE_ONLINE_PAYMENT: false,         // Онлайн-оплата
  
  // Маркетинг
  ENABLE_DISCOUNTS: true,               // Скидки
  ENABLE_FLASH_OFFERS: true,            // Акции
  ENABLE_LOYALTY_PROGRAM: false,        // Программа лояльности
  
  // Социальные функции
  ENABLE_REVIEWS: true,                 // Отзывы
  ENABLE_RATINGS: true,                 // Рейтинги
  
  // Уведомления
  ENABLE_WHATSAPP_NOTIFICATIONS: true,  // WhatsApp уведомления
  ENABLE_SMS_NOTIFICATIONS: false       // SMS уведомления
}
```

---

## 📊 Настройка Google Sheets

### 1. Создайте Google таблицу
1. Перейдите в [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу
3. Создайте листы: `Products`, `Categories`, `Orders`, `Settings`

### 2. Настройте Google Apps Script
1. В таблице: Расширения → Apps Script
2. Вставьте код из файла `google-apps-script.js` (создайте его)
3. Сохраните и разверните как веб-приложение

### 3. Обновите конфигурацию
```javascript
api: {
  baseUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
}
```

---

## 🚀 Развертывание

### Вариант 1: Netlify (рекомендуется)
1. Подключите репозиторий к Netlify
2. Команда сборки: `npm run build`
3. Папка публикации: `dist`
4. Автоматическое развертывание при каждом коммите

### Вариант 2: Vercel
1. Подключите репозиторий к Vercel
2. Автоматическая настройка для Vite
3. Мгновенное развертывание

### Вариант 3: Обычный хостинг
```bash
npm run build
# Загрузите содержимое папки dist на хостинг
```

---

## 🔍 Структура проекта

```
src/
├── config/
│   ├── clientConfig.js          ← ЕДИНСТВЕННЫЙ ФАЙЛ ДЛЯ НАСТРОЙКИ
│   ├── universalConfig.js       ← Универсальная система (НЕ ТРОГАТЬ)
│   └── googleSheetsIntegration.js
├── components/                  ← React компоненты (НЕ ТРОГАТЬ)
├── utils/
│   ├── featureFlags.js          ← Система флагов функций
│   └── themeSystem.js           ← Система тем и стилей
└── ...
```

**❗ Важно:** Для настройки нового заказчика редактируйте **ТОЛЬКО** файл `clientConfig.js`

---

## 🎯 Примеры настройки

### Пример 1: Пиццерия
```javascript
const CLIENT_SETTINGS = {
  business: {
    name: 'Пиццерия "Мама Мия"',
    appName: 'Мама Мия',
    projectTitle: 'Итальянская пицца с доставкой'
  },
  theme: {
    scheme: 'orange',
    typography: 'casual'
  },
  products: {
    markers: {
      flash: 'ГОРЯЧАЯ',
      hot: 'ОСТРАЯ', 
      popular: 'ХИТ ПРОДАЖ'
    }
  },
  delivery: {
    threshold: 1200,
    cost: 150,
    freeDeliveryText: 'Бесплатная доставка от 1200 ₽'
  }
};
```

### Пример 2: Суши-бар
```javascript
const CLIENT_SETTINGS = {
  business: {
    name: 'Суши Мастер',
    appName: 'Суши Мастер',
    projectTitle: 'Японская кухня премиум-класса'
  },
  theme: {
    scheme: 'blue',
    typography: 'elegant'
  },
  delivery: {
    threshold: 2500,
    cost: 300,
    estimatedTime: '45-75 минут'
  },
  features: {
    ENABLE_LOYALTY_PROGRAM: true, // Включаем программу лояльности
    ENABLE_ONLINE_PAYMENT: true   // Включаем онлайн-оплату
  }
};
```

### Пример 3: Здоровое питание
```javascript
const CLIENT_SETTINGS = {
  business: {
    name: 'Healthy Food',
    appName: 'Healthy Food',
    projectTitle: 'Здоровое питание с доставкой'
  },
  theme: {
    scheme: 'green',
    typography: 'modern'
  },
  products: {
    markers: {
      vegetarian: 'ВЕГАН',
      new: 'БЕЗ ГЛЮТЕНА',
      popular: 'ФИТНЕС'
    }
  },
  features: {
    ENABLE_REVIEWS: true,
    ENABLE_SHARING: true // Включаем возможность поделиться
  }
};
```

---

## 🛠️ Расширенная настройка

### Добавление новых функций
Система построена на флагах функций. Чтобы добавить новую функцию:

1. Добавьте флаг в `universalConfig.js`:
```javascript
FEATURE_FLAGS: {
  ENABLE_MY_NEW_FEATURE: false
}
```

2. Используйте в компонентах:
```javascript
import { useFeatureFlag } from './utils/featureFlags.js';

function MyComponent() {
  const hasNewFeature = useFeatureFlag('ENABLE_MY_NEW_FEATURE');
  
  return (
    <div>
      {hasNewFeature && <NewFeatureComponent />}
    </div>
  );
}
```

### Добавление новых цветовых схем
```javascript
// В universalConfig.js добавьте новую схему:
COLOR_SCHEMES: {
  myCustom: {
    primary: '#your-color',
    secondary: '#your-secondary',
    background: '#your-background',
    // ...
  }
}
```

### Кастомные стили
```javascript
// В clientConfig.js
theme: {
  scheme: 'orange',
  colors: {
    primary: '#my-custom-primary',  // Переопределяет цвет схемы
    secondary: '#my-custom-secondary'
  }
}
```

---

## 🐛 Отладка

### Проверка конфигурации
```javascript
// В консоли браузера:
import { debugFlags } from './utils/featureFlags.js';
debugFlags(); // Показать все активные флаги
```

### Временное включение функции
```javascript
// В консоли браузера (только в development):
import { setTestFlag } from './utils/featureFlags.js';
setTestFlag('ENABLE_LOYALTY_PROGRAM', true);
```

### Проверка темы
```javascript
// В консоли браузера:
import { themeSystem } from './utils/themeSystem.js';
console.log(themeSystem.getTheme()); // Показать текущую тему
```

---

## 📋 Чек-лист развертывания

### Перед развертыванием:
- [ ] Настроен `clientConfig.js`
- [ ] Создана и настроена Google таблица  
- [ ] Настроен Google Apps Script
- [ ] Обновлен `api.baseUrl` в конфигурации
- [ ] Проверены все функции в dev-режиме
- [ ] Протестировано на мобильных устройствах

### После развертывания:
- [ ] Проверена работа на продакшене
- [ ] Протестированы заказы
- [ ] Проверены уведомления WhatsApp
- [ ] Обучен персонал работе с админ-панелью
- [ ] Настроена аналитика (если включена)

---

## 🆘 Частые проблемы

### Проблема: Не загружаются данные из Google таблицы
**Решение:**
1. Проверьте правильность URL в `api.baseUrl`
2. Убедитесь, что Google Apps Script развернут как веб-приложение
3. Проверьте права доступа к таблице

### Проблема: Не применяются стили
**Решение:**
1. Проверьте правильность названия цветовой схемы
2. Очистите кэш браузера
3. Проверьте консоль на ошибки

### Проблема: Не работают функции
**Решение:**
1. Проверьте флаги функций в `features`
2. Убедитесь, что функция не требует дополнительной настройки
3. Проверьте логи в консоли

---

## 🔄 Обновления

### Обновление базовой системы
```bash
git remote add upstream <original-repo>
git fetch upstream
git merge upstream/main
# Разрешите конфликты только в clientConfig.js
```

### Сохранение настроек клиента
Всегда делайте бэкап файла `clientConfig.js` перед обновлением!

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте этот документ
2. Посмотрите примеры в коде
3. Проверьте консоль браузера на ошибки
4. Убедитесь в правильности настройки Google Sheets

---

**🎉 Готово! Теперь у вас есть полностью настроенное приложение для доставки еды под вашего заказчика!**