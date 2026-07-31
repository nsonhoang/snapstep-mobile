import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useAuth } from '../navigation/AuthContext';
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
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

   const navigateToNotification = () =>{
      navigation.navigate('Notifications');
    }
  

  
    const navigateToEditProfile = () =>{
      navigation.navigate('EditProfile');
    }
  
    const navigateToChangePassword = () =>{
      navigation.navigate('ChangePassword');
    }

    const navigateToHelp = () =>{
      navigation.navigate('HelpAndSupport');
    }

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
            <ProfileHeader />
            <MilestoneList />
            <ProfileTabs />
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
