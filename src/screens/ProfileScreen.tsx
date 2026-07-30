import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../navigation/AuthContext';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileStats } from '../components/ProfileStats';
import { MilestoneList } from '../components/MilestoneList';
import { ProfileTabs } from '../components/ProfileTabs';
import { ProfileOptionList } from '../components/ProfileOptionList';

export const ProfileScreen = (): React.JSX.Element => {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      {/* 
        Sử dụng ScrollView với contentInsetAdjustmentBehavior="automatic" 
        thay vì SafeAreaView theo đúng chuẩn expo-native-ui. 
      */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <ProfileHeader />
        
        <ProfileStats />
        
        <MilestoneList />
        
        <ProfileTabs />

        <ProfileOptionList onLogout={logout} />
      </ScrollView>
    </View>
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
