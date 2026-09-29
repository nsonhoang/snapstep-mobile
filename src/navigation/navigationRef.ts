import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

// Tham chiếu điều hướng toàn cục (Global Navigation Reference)
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
