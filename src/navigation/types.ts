import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { ExplorePost } from '../components/ExplorePostCard';

export type MainTabParamList = {
  Explore: undefined;
  Conquest: undefined;
  Snap: undefined;
  Friends: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Password: { identifier: string; isPhone: boolean };
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Home: undefined;
  PostDetail: { post: ExplorePost };
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type PasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'Password'>;
export type PostDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'Home'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ExploreScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Explore'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type ConquestScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Conquest'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type FriendsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Friends'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;
