import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Returns full API URL for Web and Native (iOS / Android)
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.replace(/^\//, '');

  if (Platform.OS === 'web') {
    return `/api/${cleanPath}`;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return `http://localhost:8081/api/${cleanPath}`;
  }

  return `http://${hostUri}/api/${cleanPath}`;
}