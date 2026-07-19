import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Password: { identifier: string; isPhone: boolean };
  Home: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type PasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'Password'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
