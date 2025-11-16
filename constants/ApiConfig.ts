// UNTUK SEMUA DEVELOPER - URL SAMA
export const API_CONFIG = {
  // Development - URL tetap
  DEVELOPMENT: 'https://strux-api.loca.lt/api',
  
  // Production  
  PRODUCTION: 'https://api.struxrental.com/api'
};

export const API_BASE_URL = __DEV__ 
  ? API_CONFIG.DEVELOPMENT 
  : API_CONFIG.PRODUCTION;

export default API_CONFIG;