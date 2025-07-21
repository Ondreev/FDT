export const API_URL = 'https://script.google.com/macros/s/AKfycbxIz5qxFXEc3vW4TnWkGyZAVA4Y9psWkvWXl7iR5V_vyyAT-fsmpGPGInuF2C3MIw427w/exec';

// Настройки доставки
export const DELIVERY_THRESHOLD = 2000;
export const DELIVERY_COST = 200;

// Настройки таймеров
export const FLASH_TIMER_DURATION = 120; // секунды

// Идентификаторы специальных товаров
export const FLASH_PRODUCT_MARKER = 'R2000';
export const HOT_PRODUCT_MARKER = 'H';

// Анимации
export const ANIMATIONS = {
  slideIn: `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
  slideInLeft: `
    @keyframes slideInLeft {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(0);
      }
    }
  `,
  flashPulse: `
    @keyframes flashPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.01); }
    }
  `,
  deliveryPulse: `
    @keyframes deliveryPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.005); }
    }
  `,
  timerBlink: `
    @keyframes timerBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `
};
