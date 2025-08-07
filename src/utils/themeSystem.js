// themeSystem.js - Универсальная система тем и стилей

import { clientConfig } from '../config/clientConfig.js';

/**
 * Система тем позволяет:
 * 1. Централизованно управлять всеми стилями
 * 2. Легко менять внешний вид без изменения кода
 * 3. Создавать консистентный дизайн
 * 4. Поддерживать темную/светлую темы
 * 5. Адаптировать стили под бренд заказчика
 */

class ThemeSystem {
  constructor(config) {
    this.config = config;
    this.theme = null;
    this.cssVariables = null;
    this.compiledStyles = new Map();
  }

  /**
   * Получить текущую тему
   * @returns {Object} Объект темы
   */
  getTheme() {
    if (!this.theme) {
      this.theme = this.config.getComponentConfig('theme');
    }
    return this.theme;
  }

  /**
   * Получить цвет из темы
   * @param {string} colorName - Название цвета
   * @param {number} alpha - Прозрачность (0-1)
   * @returns {string} CSS цвет
   */
  getColor(colorName, alpha = 1) {
    const theme = this.getTheme();
    const color = theme.colors[colorName] || theme.colors.primary;
    
    if (alpha < 1) {
      // Конвертируем hex в rgba
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return color;
  }

  /**
   * Получить размер шрифта
   * @param {string} sizeName - Название размера
   * @returns {string} CSS размер
   */
  getFontSize(sizeName) {
    const theme = this.getTheme();
    return theme.typography.sizes[sizeName] || theme.typography.sizes.base;
  }

  /**
   * Получить вес шрифта
   * @param {string} weightName - Название веса
   * @returns {number} CSS font-weight
   */
  getFontWeight(weightName) {
    const theme = this.getTheme();
    return theme.typography.weights[weightName] || theme.typography.weights.normal;
  }

  /**
   * Получить основной шрифт
   * @returns {string} CSS font-family
   */
  getPrimaryFont() {
    const theme = this.getTheme();
    return theme.typography.primary;
  }

  /**
   * Получить вторичный шрифт
   * @returns {string} CSS font-family
   */
  getSecondaryFont() {
    const theme = this.getTheme();
    return theme.typography.secondary || theme.typography.primary;
  }

  /**
   * Получить отступ
   * @param {string} spaceName - Название отступа
   * @returns {string} CSS размер
   */
  getSpacing(spaceName) {
    const theme = this.getTheme();
    return theme.ui.spacing[spaceName] || theme.ui.spacing.md;
  }

  /**
   * Получить радиус скругления
   * @param {string} radiusName - Название радиуса
   * @returns {string} CSS border-radius
   */
  getBorderRadius(radiusName) {
    const theme = this.getTheme();
    return theme.ui.borderRadius[radiusName] || theme.ui.borderRadius.md;
  }

  /**
   * Получить тень
   * @param {string} shadowName - Название тени
   * @returns {string} CSS box-shadow
   */
  getShadow(shadowName) {
    const theme = this.getTheme();
    return theme.ui.shadows[shadowName] || theme.ui.shadows.md;
  }

  /**
   * Создать градиент
   * @param {string} fromColor - Начальный цвет
   * @param {string} toColor - Конечный цвет
   * @param {string} direction - Направление градиента
   * @returns {string} CSS linear-gradient
   */
  createGradient(fromColor, toColor, direction = '135deg') {
    const from = this.getColor(fromColor);
    const to = this.getColor(toColor);
    return `linear-gradient(${direction}, ${from}, ${to})`;
  }

  /**
   * Создать стиль кнопки
   * @param {string} variant - Вариант кнопки (primary, secondary, outline, ghost)
   * @param {string} size - Размер кнопки (sm, md, lg)
   * @returns {Object} CSS стили
   */
  getButtonStyle(variant = 'primary', size = 'md') {
    const cacheKey = `button_${variant}_${size}`;
    
    if (this.compiledStyles.has(cacheKey)) {
      return this.compiledStyles.get(cacheKey);
    }

    const theme = this.getTheme();
    const baseStyle = {
      fontFamily: this.getPrimaryFont(),
      fontWeight: this.getFontWeight('medium'),
      borderRadius: this.getBorderRadius('md'),
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: this.getSpacing('sm')
    };

    // Размеры
    const sizes = {
      sm: {
        padding: `${this.getSpacing('sm')} ${this.getSpacing('md')}`,
        fontSize: this.getFontSize('sm'),
        minHeight: '32px'
      },
      md: {
        padding: `${this.getSpacing('md')} ${this.getSpacing('lg')}`,
        fontSize: this.getFontSize('base'),
        minHeight: '40px'
      },
      lg: {
        padding: `${this.getSpacing('lg')} ${this.getSpacing('xl')}`,
        fontSize: this.getFontSize('lg'),
        minHeight: '48px'
      }
    };

    // Варианты
    const variants = {
      primary: {
        backgroundColor: this.getColor('primary'),
        color: '#ffffff',
        boxShadow: this.getShadow('sm')
      },
      secondary: {
        backgroundColor: this.getColor('secondary'),
        color: '#ffffff',
        boxShadow: this.getShadow('sm')
      },
      outline: {
        backgroundColor: 'transparent',
        color: this.getColor('primary'),
        border: `2px solid ${this.getColor('primary')}`
      },
      ghost: {
        backgroundColor: 'transparent',
        color: this.getColor('primary'),
        border: 'none'
      },
      success: {
        backgroundColor: this.getColor('success'),
        color: '#ffffff',
        boxShadow: this.getShadow('sm')
      },
      warning: {
        backgroundColor: this.getColor('warning'),
        color: '#ffffff',
        boxShadow: this.getShadow('sm')
      },
      error: {
        backgroundColor: this.getColor('error'),
        color: '#ffffff',
        boxShadow: this.getShadow('sm')
      }
    };

    const style = {
      ...baseStyle,
      ...sizes[size],
      ...variants[variant]
    };

    this.compiledStyles.set(cacheKey, style);
    return style;
  }

  /**
   * Создать стиль карточки
   * @param {string} variant - Вариант карточки (default, elevated, outlined)
   * @returns {Object} CSS стили
   */
  getCardStyle(variant = 'default') {
    const cacheKey = `card_${variant}`;
    
    if (this.compiledStyles.has(cacheKey)) {
      return this.compiledStyles.get(cacheKey);
    }

    const baseStyle = {
      backgroundColor: this.getColor('surface'),
      borderRadius: this.getBorderRadius('lg'),
      overflow: 'hidden'
    };

    const variants = {
      default: {
        ...baseStyle
      },
      elevated: {
        ...baseStyle,
        boxShadow: this.getShadow('lg')
      },
      outlined: {
        ...baseStyle,
        border: `1px solid ${this.getColor('primary', 0.2)}`
      }
    };

    const style = variants[variant];
    this.compiledStyles.set(cacheKey, style);
    return style;
  }

  /**
   * Создать стиль инпута
   * @param {string} state - Состояние инпута (default, focused, error, disabled)
   * @returns {Object} CSS стили
   */
  getInputStyle(state = 'default') {
    const cacheKey = `input_${state}`;
    
    if (this.compiledStyles.has(cacheKey)) {
      return this.compiledStyles.get(cacheKey);
    }

    const baseStyle = {
      fontFamily: this.getPrimaryFont(),
      fontSize: this.getFontSize('base'),
      padding: `${this.getSpacing('md')} ${this.getSpacing('md')}`,
      borderRadius: this.getBorderRadius('md'),
      border: `2px solid ${this.getColor('primary', 0.2)}`,
      backgroundColor: this.getColor('surface'),
      color: this.getColor('text'),
      transition: 'all 0.2s ease',
      outline: 'none',
      width: '100%'
    };

    const states = {
      default: baseStyle,
      focused: {
        ...baseStyle,
        borderColor: this.getColor('primary'),
        boxShadow: `0 0 0 3px ${this.getColor('primary', 0.1)}`
      },
      error: {
        ...baseStyle,
        borderColor: this.getColor('error'),
        boxShadow: `0 0 0 3px ${this.getColor('error', 0.1)}`
      },
      disabled: {
        ...baseStyle,
        backgroundColor: this.getColor('primary', 0.05),
        borderColor: this.getColor('primary', 0.1),
        color: this.getColor('textSecondary'),
        cursor: 'not-allowed'
      }
    };

    const style = states[state];
    this.compiledStyles.set(cacheKey, style);
    return style;
  }

  /**
   * Создать стиль статуса заказа
   * @param {string} status - Статус заказа
   * @returns {Object} CSS стили
   */
  getStatusStyle(status) {
    const cacheKey = `status_${status}`;
    
    if (this.compiledStyles.has(cacheKey)) {
      return this.compiledStyles.get(cacheKey);
    }

    const orderStatuses = this.config.getComponentConfig('orderStatuses');
    const statusConfig = orderStatuses[status];

    if (!statusConfig) {
      return {};
    }

    const style = {
      backgroundColor: statusConfig.color,
      color: '#ffffff',
      padding: `${this.getSpacing('xs')} ${this.getSpacing('sm')}`,
      borderRadius: this.getBorderRadius('full'),
      fontSize: this.getFontSize('sm'),
      fontWeight: this.getFontWeight('medium'),
      display: 'inline-flex',
      alignItems: 'center',
      gap: this.getSpacing('xs')
    };

    this.compiledStyles.set(cacheKey, style);
    return style;
  }

  /**
   * Создать CSS переменные для темы
   * @returns {Object} CSS переменные
   */
  getCSSVariables() {
    if (this.cssVariables) {
      return this.cssVariables;
    }

    const theme = this.getTheme();
    const variables = {};

    // Цвета
    Object.keys(theme.colors).forEach(colorName => {
      variables[`--color-${colorName}`] = theme.colors[colorName];
    });

    // Шрифты
    variables['--font-primary'] = theme.typography.primary;
    variables['--font-secondary'] = theme.typography.secondary;

    // Размеры шрифтов
    Object.keys(theme.typography.sizes).forEach(sizeName => {
      variables[`--font-size-${sizeName}`] = theme.typography.sizes[sizeName];
    });

    // Веса шрифтов
    Object.keys(theme.typography.weights).forEach(weightName => {
      variables[`--font-weight-${weightName}`] = theme.typography.weights[weightName];
    });

    // Отступы
    Object.keys(theme.ui.spacing).forEach(spaceName => {
      variables[`--spacing-${spaceName}`] = theme.ui.spacing[spaceName];
    });

    // Радиусы
    Object.keys(theme.ui.borderRadius).forEach(radiusName => {
      variables[`--radius-${radiusName}`] = theme.ui.borderRadius[radiusName];
    });

    // Тени
    Object.keys(theme.ui.shadows).forEach(shadowName => {
      variables[`--shadow-${shadowName}`] = theme.ui.shadows[shadowName];
    });

    this.cssVariables = variables;
    return variables;
  }

  /**
   * Применить CSS переменные к документу
   */
  applyGlobalStyles() {
    const variables = this.getCSSVariables();
    const root = document.documentElement;

    Object.keys(variables).forEach(varName => {
      root.style.setProperty(varName, variables[varName]);
    });

    // Подключаем Google Fonts
    this.loadGoogleFonts();
  }

  /**
   * Загрузить Google Fonts
   */
  loadGoogleFonts() {
    const theme = this.getTheme();
    const googleFonts = theme.typography.googleFonts;

    if (!googleFonts) return;

    // Проверяем, не загружен ли уже этот шрифт
    const existingLink = document.querySelector(`link[href*="${googleFonts}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${googleFonts}&display=swap`;
    document.head.appendChild(link);
  }

  /**
   * Создать адаптивные стили
   * @param {Object} styles - Стили для разных экранов
   * @returns {string} CSS медиа-запросы
   */
  createResponsiveStyles(styles) {
    const breakpoints = {
      mobile: '(max-width: 768px)',
      tablet: '(min-width: 769px) and (max-width: 1024px)',
      desktop: '(min-width: 1025px)'
    };

    let css = '';

    Object.keys(styles).forEach(breakpoint => {
      if (breakpoints[breakpoint]) {
        css += `@media ${breakpoints[breakpoint]} { ${styles[breakpoint]} }`;
      }
    });

    return css;
  }

  /**
   * Очистить кэш стилей
   */
  clearCache() {
    this.compiledStyles.clear();
    this.theme = null;
    this.cssVariables = null;
  }
}

// Создаем глобальный экземпляр
export const themeSystem = new ThemeSystem(clientConfig);

// ========================================
// ХЕЛПЕРЫ ДЛЯ БЫСТРОГО ДОСТУПА
// ========================================

// Цвета
export const colors = {
  primary: () => themeSystem.getColor('primary'),
  secondary: () => themeSystem.getColor('secondary'),
  background: () => themeSystem.getColor('background'),
  surface: () => themeSystem.getColor('surface'),
  text: () => themeSystem.getColor('text'),
  textSecondary: () => themeSystem.getColor('textSecondary'),
  success: () => themeSystem.getColor('success'),
  warning: () => themeSystem.getColor('warning'),
  error: () => themeSystem.getColor('error'),
  info: () => themeSystem.getColor('info')
};

// Шрифты
export const fonts = {
  primary: () => themeSystem.getPrimaryFont(),
  secondary: () => themeSystem.getSecondaryFont(),
  size: (name) => themeSystem.getFontSize(name),
  weight: (name) => themeSystem.getFontWeight(name)
};

// UI элементы
export const ui = {
  spacing: (name) => themeSystem.getSpacing(name),
  radius: (name) => themeSystem.getBorderRadius(name),
  shadow: (name) => themeSystem.getShadow(name)
};

// Готовые стили
export const styles = {
  button: (variant, size) => themeSystem.getButtonStyle(variant, size),
  card: (variant) => themeSystem.getCardStyle(variant),
  input: (state) => themeSystem.getInputStyle(state),
  status: (status) => themeSystem.getStatusStyle(status)
};

// ========================================
// REACT ХУКИ ДЛЯ ТЕМ
// ========================================

import { useState, useEffect } from 'react';

/**
 * Хук для использования темы в React компонентах
 * @returns {Object} Объект с функциями темы
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => themeSystem.getTheme());

  // Функция для обновления темы
  const updateTheme = () => {
    themeSystem.clearCache();
    setTheme(themeSystem.getTheme());
  };

  return {
    theme,
    colors: {
      primary: themeSystem.getColor('primary'),
      secondary: themeSystem.getColor('secondary'),
      background: themeSystem.getColor('background'),
      surface: themeSystem.getColor('surface'),
      text: themeSystem.getColor('text'),
      textSecondary: themeSystem.getColor('textSecondary'),
      success: themeSystem.getColor('success'),
      warning: themeSystem.getColor('warning'),
      error: themeSystem.getColor('error'),
      info: themeSystem.getColor('info')
    },
    fonts: {
      primary: themeSystem.getPrimaryFont(),
      secondary: themeSystem.getSecondaryFont()
    },
    getColor: (name, alpha) => themeSystem.getColor(name, alpha),
    getFontSize: (name) => themeSystem.getFontSize(name),
    getFontWeight: (name) => themeSystem.getFontWeight(name),
    getSpacing: (name) => themeSystem.getSpacing(name),
    getBorderRadius: (name) => themeSystem.getBorderRadius(name),
    getShadow: (name) => themeSystem.getShadow(name),
    getButtonStyle: (variant, size) => themeSystem.getButtonStyle(variant, size),
    getCardStyle: (variant) => themeSystem.getCardStyle(variant),
    getInputStyle: (state) => themeSystem.getInputStyle(state),
    getStatusStyle: (status) => themeSystem.getStatusStyle(status),
    updateTheme
  };
}

/**
 * Хук для применения глобальных стилей
 */
export function useGlobalStyles() {
  useEffect(() => {
    themeSystem.applyGlobalStyles();
  }, []);
}

// ========================================
// КОМПОНЕНТЫ С ТЕМИЗАЦИЕЙ
// ========================================

/**
 * Компонент кнопки с автоматической темизацией
 */
export function ThemedButton({ variant = 'primary', size = 'md', children, style = {}, ...props }) {
  const buttonStyle = themeSystem.getButtonStyle(variant, size);
  
  return (
    <button
      style={{
        ...buttonStyle,
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Компонент карточки с автоматической темизацией
 */
export function ThemedCard({ variant = 'default', children, style = {}, ...props }) {
  const cardStyle = themeSystem.getCardStyle(variant);
  
  return (
    <div
      style={{
        ...cardStyle,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Компонент инпута с автоматической темизацией
 */
export function ThemedInput({ state = 'default', style = {}, ...props }) {
  const inputStyle = themeSystem.getInputStyle(state);
  
  return (
    <input
      style={{
        ...inputStyle,
        ...style
      }}
      {...props}
    />
  );
}

// Инициализация глобальных стилей при импорте
if (typeof document !== 'undefined') {
  // Применяем стили после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      themeSystem.applyGlobalStyles();
    });
  } else {
    themeSystem.applyGlobalStyles();
  }
}

// Экспортируем основной класс
export { ThemeSystem };

// ========================================
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
// ========================================

/*

// В React компоненте:
import { useTheme, ThemedButton, ThemedCard } from './utils/themeSystem.js';

function MyComponent() {
  const { colors, getButtonStyle } = useTheme();
  
  return (
    <div style={{ backgroundColor: colors.background }}>
      <ThemedCard variant="elevated">
        <h2 style={{ color: colors.text }}>Заголовок</h2>
        <ThemedButton variant="primary" size="lg">
          Кнопка
        </ThemedButton>
      </ThemedCard>
    </div>
  );
}

// В обычном JS:
import { themeSystem, colors, styles } from './utils/themeSystem.js';

const buttonElement = document.createElement('button');
Object.assign(buttonElement.style, styles.button('primary', 'md'));
buttonElement.textContent = 'Кнопка';

// CSS переменные:
const variables = themeSystem.getCSSVariables();
console.log(variables); // { '--color-primary': '#ff7f32', ... }

// Применить глобальные стили:
themeSystem.applyGlobalStyles();

*/