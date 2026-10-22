import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  // When running in a web browser (e.g. Chrome, Edge on localhost:8081)
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `http://${window.location.hostname}:8080/api/v1`;
    }
    return 'http://localhost:8080/api/v1';
  }

  // When running on Android emulator (10.0.2.2 connects to host PC localhost)
  // For physical Android devices via Expo Go on Wi-Fi, use your PC's LAN IP: 'http://192.168.1.204:8080/api/v1'
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }

  // iOS simulator or default
  return 'http://localhost:8080/api/v1';
};

export const CONFIG = {
  API_BASE_URL: getApiBaseUrl(),
  FALLBACK_API_BASE_URL: 'http://localhost:8080/api/v1',
  DEFAULT_LANGUAGE: 'mr',
  DEFAULT_CURRENCY: '₹',
  APP_VERSION: '1.0.0',
  APP_NAME: 'Smart Shetkari'
};
