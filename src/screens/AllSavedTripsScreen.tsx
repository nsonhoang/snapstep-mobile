import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, FlatList } from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AllSavedTripsScreenProps } from '../navigation/types';
import { SavedTripCard, SavedTripInfo } from '../components/SavedTripCard';
import { CreateTripModal } from '../components/CreateTripModal';
import { Skeleton } from '../components/Skeleton';
import { Value } from '../constants/Value';

// Dữ liệu giả lập cho danh sách hành trình
const MOCK_ROUTES: SavedTripInfo[] = [
  {
    id: '1',
    title: 'Hai Van Pass Loop',
    location: 'Da Nang, VN',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=300',
  },
  {
    id: '2',
    title: 'Hoi An Heritage Walk',
    location: 'Quang Nam, VN',
    image: 'https://images.unsplash.com/photo-1552308995-2baac1ad5490?q=80&w=300',
  },
  {
    id: '3',
    title: 'Sa Pa Trekking',
    location: 'Lao Cai, VN',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=300',
  },
  {
    id: '4',
    title: 'Ha Long Bay Cruise',
    location: 'Quang Ninh, VN',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=300',
  }
];

export const AllSavedTripsScreen = ({ navigation }: AllSavedTripsScreenProps): React.JSX.Element => {
  const trips = useMemo(() => MOCK_ROUTES, []);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Giả lập thời gian tải API
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Xử lý khi nhấn vào 1 hành trình để xem chi tiết
  const handlePressTrip = (tripId: string) => {
    navigation.navigate('SavedTrip', { tripId });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header cố định */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Hành trình đã lưu</Text>
        {/* View trống để căn giữa tiêu đề */}
        <View style={{ width: 24 }} />
      </View>

      {/* Danh sách hành trình */}
      <FlatList
        data={isLoading ? (['1', '2', '3'] as unknown as typeof trips) : trips}
        keyExtractor={(item, index) => isLoading ? `skeleton-${index}` : (item ).id}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          if (isLoading) {
            return (
              <View style={{ marginBottom: 20, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                <Skeleton style={{ height: 200, width: '100%' }} />
                <View style={{ padding: 16 }}>
                  <Skeleton style={{ height: 24, width: '70%', borderRadius: 6, marginBottom: 8 }} />
                  <Skeleton style={{ height: 16, width: '40%', borderRadius: 4 }} />
                </View>
              </View>
            );
          }
          return <SavedTripCard trip={item } onPress={handlePressTrip} />;
        }}
      />
      <View style={styles.newTripButton}>
        <Pressable 
          style={{flex: 1, justifyContent: 'center', alignItems: 'center' , flexDirection:"row", gap:5}}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{fontSize: 18, color: Colors.white, fontWeight: '600', }}>Chuyến đi mới</Text>
         <FontAwesome5 name="walking" size={24} color="white" />
          </Pressable>
      </View>

      {/* Modal tạo chuyến đi mới */}
      <CreateTripModal visible={isModalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
    padding: 4,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    zIndex: -1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  newTripButton:{

    position:'absolute',
    bottom:20,
    right:0,
    left:0,
    backgroundColor:Colors.primary,
    padding:12,
    borderRadius:20,
    marginHorizontal:20,
    marginBottom:20,
  }
});
