import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../stores/authStore';
import { useFriendshipStore } from '../stores/friendshipStore';
import { UserService, UserWithId } from '../services/userService';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileStats } from '../components/ProfileStats';
import { MilestoneList } from '../components/MilestoneList';
import { ProfileTabs } from '../components/ProfileTabs';
import { ProfileOptionList } from '../components/ProfileOptionList';
import { Skeleton } from '../components/Skeleton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user: authUser, logout } = useAuthStore();
  const { friends, subscribeFriends } = useFriendshipStore();

  const [profile, setProfile] = useState<UserWithId | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [snapsCount, setSnapsCount] = useState<number>(0);
  const [tripsCount, setTripsCount] = useState<number>(0);

  // Lắng nghe hồ sơ người dùng và danh sách bạn bè realtime
  useEffect(() => {
    if (!authUser?.uid) {
      setIsLoading(false);
      return;
    }

    // Đăng ký realtime lắng nghe thay đổi thông tin người dùng
    const unsubscribeProfile = UserService.subscribeUserProfile(
      authUser.uid,
      (data) => {
        setProfile(data);
        setIsLoading(false);
      },
    );

    // Đăng ký realtime danh sách bạn bè để hiển thị số lượng BUDDIES chính xác
    const unsubscribeFriends = subscribeFriends(authUser.uid);

    return () => {
      unsubscribeProfile();
      unsubscribeFriends();
    };
  }, [authUser?.uid, subscribeFriends]);

  const navigateToNotification = () => {
    navigation.navigate('Notifications');
  };

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const navigateToChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const navigateToHelp = () => {
    navigation.navigate('HelpAndSupport');
  };

  // Tính toán dữ liệu hiển thị thật
  const emailName = authUser?.email ? authUser.email.split('@')[0] : 'SnapStep Explorer';
  const rawFirstName = profile?.firstName || authUser?.displayName || emailName;
  const rawLastName = profile?.lastName || authUser?.displayName || emailName;
  const displayName =
    rawLastName === rawFirstName
      ? rawFirstName
      : `${rawLastName} ${rawFirstName}`.trim();

  const username = profile?.username || emailName;
  const bio = profile?.bio;
  const avatarUrl = profile?.avatarUrl || authUser?.photoURL || undefined;

  const footprints = profile?.stats?.conqueredProvincesCount ?? tripsCount;
  const snaps = profile?.stats?.totalPhotosCount ?? snapsCount;
  const buddies = friends.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        {isLoading ? (
          <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 20 }}>
            <Skeleton style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 16 }} />
            <Skeleton style={{ width: 160, height: 28, borderRadius: 8, marginBottom: 12 }} />
            <Skeleton style={{ width: 220, height: 16, borderRadius: 4, marginBottom: 24 }} />
            
            <View style={{ flexDirection: 'row', gap: 24, marginBottom: 32 }}>
              <Skeleton style={{ width: 60, height: 40, borderRadius: 8 }} />
              <Skeleton style={{ width: 60, height: 40, borderRadius: 8 }} />
              <Skeleton style={{ width: 60, height: 40, borderRadius: 8 }} />
            </View>

            <Skeleton style={{ width: '90%', height: 120, borderRadius: 16, marginBottom: 24 }} />
            <Skeleton style={{ width: '90%', height: 200, borderRadius: 16 }} />
          </View>
        ) : (
          <>
            <ProfileHeader 
              displayName={displayName}
              username={username}
              bio={bio}
              avatarUrl={avatarUrl}
              onSettingsPress={navigateToNotification}
            />
            <ProfileStats 
              footprintsCount={footprints}
              snapsCount={snaps}
              buddiesCount={buddies}
            />
            <MilestoneList />
            <ProfileTabs 
              userId={authUser?.uid}
              onSnapsCountChange={setSnapsCount}
              onTripsCountChange={setTripsCount}
            />
            <ProfileOptionList 
              onLogout={logout} 
              navigateToNotification={navigateToNotification}
              navigateToEditProfile={navigateToEditProfile}
              navigateToChangePassword={navigateToChangePassword}
              navigateToHelp={navigateToHelp}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
