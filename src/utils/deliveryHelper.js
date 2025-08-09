// utils/deliveryHelper.js
export const getZoneInfo = () => {
  try {
    const zoneInfo = localStorage.getItem('deliveryZoneInfo');
    return zoneInfo ? JSON.parse(zoneInfo) : { freeFrom: 3000 };
  } catch (e) {
    return { freeFrom: 3000 };
  }
};

export const getFreeDeliveryThreshold = () => {
  return getZoneInfo().freeFrom;
};
