// utils/deliveryZones.js - Система проверки зон доставки

// ✅ ВАШ API КЛЮЧ ЯНДЕКС ГЕОКОДЕРА
const YANDEX_API_KEY = '74b46206-b9f0-4591-a22c-5fabeb409e5b';

// ✅ ГЕОДАННЫЕ ВАШИХ ЗОН (из GeoJSON)
const DELIVERY_ZONES_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "description": "Синяя зона",
        "fill": "#82cdff",
        "cost": 300,
        "freeFrom": 3000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[37.81583353906171,55.74436879106453],[37.82940848346071,55.74662136615606],[37.83451824189242,55.747603325952966],[37.84172801972382,55.7484747323135],[37.842399654403614,55.75854922864241],[37.842950198435005,55.767960716628295],[37.8422991128277,55.776886171020465],[37.86175295739642,55.78187313171203],[37.85831972985777,55.78569412042311],[37.841229928991105,55.7835418376125],[37.83002427721499,55.782030331692134],[37.81916194819282,55.78037365357317],[37.8194384279774,55.758310117874224],[37.816863507323156,55.75250183978107],[37.81583353906171,55.74436879106453]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "description": "Желтая зона",
        "fill": "#ffd21e", 
        "cost": 150,
        "freeFrom": 950
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[37.84391678312732,55.766246692603076],[37.8437451217505,55.76276254222024],[37.84297264555414,55.74901645535334],[37.85842216947996,55.752405027179734],[37.872326741013104,55.755309282038446],[37.87507332304415,55.75666452666454],[37.87713325956761,55.75927807916689],[37.87601746061743,55.7621818200962],[37.873871693405576,55.764746610638824],[37.862284550461304,55.78090573250224],[37.85745657423434,55.77999877438392],[37.85340107420379,55.77904342226012],[37.849688896927056,55.778039672532366],[37.84357346037307,55.776503764270785],[37.84383095243874,55.76944022246199],[37.84391678312732,55.766246692603076]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "description": "Зеленая зона",
        "fill": "#56db40",
        "cost": 300,
        "freeFrom": 3000
      },
      "geometry": {
        "type": "Polygon", 
        "coordinates": [[[37.84354638181263,55.74819347231945],[37.84165810666612,55.73100365699404],[37.84715127072865,55.73119738741747],[37.85436104856069,55.73110052232957],[37.86088418088488,55.73013185817522],[37.86277245603137,55.73400636997128],[37.86603402219348,55.736621447127405],[37.8689522656017,55.73783207140884],[37.874359598975715,55.739091080658085],[37.87873696408803,55.74209316888809],[37.88697671018176,55.74843552810092],[37.89006661496693,55.749694193820005],[37.88972329221301,55.75196937066804],[37.886461726050904,55.757245331759464],[37.8725571545177,55.75448643233012],[37.861484995704224,55.75230821539284],[37.85642098508412,55.75095281875811],[37.84354638181263,55.74819347231945]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "description": "Оранжевая зона", 
        "fill": "#ff931e",
        "cost": 350,
        "freeFrom": 3500
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[37.772993555884746,55.762220578785424],[37.78294991574803,55.745956848777695],[37.81110238156829,55.74376604928347],[37.81587939582377,55.74210376583404],[37.819297871213244,55.73827044581616],[37.824611997824,55.737128453227236],[37.82932899765283,55.73549206203198],[37.82928423828989,55.72518076371772],[37.82531364693849,55.72128367496632],[37.82229838300109,55.71865671653857],[37.82199238067105,55.715986554306404],[37.831299415450395,55.71331620876663],[37.833986988883304,55.71367166823065],[37.83764552197962,55.713801131892005],[37.83775281034018,55.72084300307604],[37.84054230771568,55.74760894453215],[37.81532954297569,55.74403082786178],[37.8150076778939,55.747714845717226],[37.81599473081137,55.7513062377154],[37.81848382077712,55.75830048110012],[37.8181404980231,55.770736957741796],[37.814878931861365,55.77005958690573],[37.7956528576426,55.76647900179689],[37.772993555884746,55.762220578785424]]]
      }
    }
  ]
};

// ✅ ФУНКЦИЯ ГЕОКОДИРОВАНИЯ ЧЕРЕЗ ЯНДЕКС API
const geocodeAddress = async (address) => {
  try {
    console.log('🔍 Геокодирую адрес:', address);
    
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json&results=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const geoObjects = data.response?.GeoObjectCollection?.featureMember;
    
    if (!geoObjects || geoObjects.length === 0) {
      console.log('❌ Адрес не найден');
      return null;
    }
    
    const coordinates = geoObjects[0].GeoObject.Point.pos.split(' ');
    const lon = parseFloat(coordinates[0]);
    const lat = parseFloat(coordinates[1]);
    
    console.log('📍 Координаты:', lat, lon);
    return { lat, lon };
    
  } catch (error) {
    console.error('❌ Ошибка геокодирования:', error);
    return null;
  }
};

// ✅ АЛГОРИТМ "ТОЧКА В ПОЛИГОНЕ" (Ray Casting)
const pointInPolygon = (point, polygon) => {
  const [x, y] = [point.lon, point.lat];
  const coords = polygon[0]; // Берем внешний контур
  
  let inside = false;
  
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [xi, yi] = coords[i];
    const [xj, yj] = coords[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
};

// ✅ ФУНКЦИЯ ОПРЕДЕЛЕНИЯ ЗОНЫ ДОСТАВКИ ПО КООРДИНАТАМ (ЭКСПОРТИРУЕМ!)
export const getDeliveryZoneByCoords = (coordinates) => {
  for (const feature of DELIVERY_ZONES_GEOJSON.features) {
    if (pointInPolygon(coordinates, feature.geometry.coordinates)) {
      return {
        zone: feature.properties.description.toLowerCase().replace(' зона', '').replace('ая', 'ая').replace('яя', 'яя'),
        cost: feature.properties.cost,
        freeFrom: feature.properties.freeFrom,
        label: feature.properties.description,
        color: feature.properties.fill
      };
    }
  }
  
  return null;
};

// ✅ ГЛАВНАЯ ФУНКЦИЯ ПРОВЕРКИ АДРЕСА
export const checkDeliveryZone = async (address) => {
  try {
    console.log('\n🎯 Проверяем зону доставки для:', address);
    
    // 1. Геокодируем адрес
    const coordinates = await geocodeAddress(address);
    if (!coordinates) {
      return { 
        success: false, 
        error: 'Адрес не найден или некорректен' 
      };
    }
    
    // 2. Проверяем попадание в зоны
    const zone = getDeliveryZoneByCoords(coordinates);
    
    if (zone) {
      console.log('✅ Адрес в зоне:', zone.label);
      console.log('💰 Стоимость доставки:', zone.cost + '₽');
      console.log('🆓 Бесплатно от:', zone.freeFrom + '₽');
      
      return {
        success: true,
        zone: zone.zone,
        cost: zone.cost,
        freeFrom: zone.freeFrom,
        label: zone.label,
        coordinates: coordinates
      };
    } else {
      console.log('❌ Адрес за пределами зон доставки');
      return {
        success: false,
        error: 'Доставка по указанному адресу недоступна',
        coordinates: coordinates
      };
    }
    
  } catch (error) {
    console.error('💥 Ошибка проверки зоны:', error);
    return {
      success: false,
      error: 'Ошибка при проверке адреса: ' + error.message
    };
  }
};

// ✅ КЭШИРОВАНИЕ РЕЗУЛЬТАТОВ (чтобы не делать повторные запросы)
const addressCache = new Map();

export const checkDeliveryZoneCached = async (address) => {
  const cacheKey = address.toLowerCase().trim();
  
  if (addressCache.has(cacheKey)) {
    console.log('📦 Результат из кэша для:', address);
    return addressCache.get(cacheKey);
  }
  
  const result = await checkDeliveryZone(address);
  addressCache.set(cacheKey, result);
  
  return result;
};
