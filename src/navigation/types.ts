import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { ExplorePost } from '../components/ExplorePostCard';

export type MainTabParamList = {
  Explore: { filter?: string } | undefined;
  Map: undefined;
  Snap: undefined;
  Friends: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: undefined;
  Password: { identifier: string; isPhone: boolean };
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Home: undefined;
  PostDetail: { post: ExplorePost; posts?: ExplorePost[] };
  Conquest: undefined;
  SearchBuddies: undefined;
  Notifications: undefined;
  SavedTrip: { tripId: string };
  AllSavedTrips: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  HelpAndSupport: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type VerifyEmailScreenProps = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;
export type PasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'Password'>;
export type PostDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;
export type SavedTripScreenProps = NativeStackScreenProps<RootStackParamList, 'SavedTrip'>;
export type AllSavedTripsScreenProps = NativeStackScreenProps<RootStackParamList, 'AllSavedTrips'>;
export type EditProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;
export type ChangePasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;
export type HelpAndSupportScreenProps = NativeStackScreenProps<RootStackParamList, 'HelpAndSupport'>;

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'Home'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ExploreScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Explore'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type MapScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Map'>,
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
