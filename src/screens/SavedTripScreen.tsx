import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';
import { SavedTripScreenProps } from '../navigation/types';
import { CreateTripModal, TripData } from '../components/CreateTripModal';
import { Skeleton } from '../components/Skeleton';

export const SavedTripScreen = ({ route }: SavedTripScreenProps): React.JSX.Element => {
  const navigation = useNavigation();
  // Lấy ID hành trình từ param, mặc định là '1' nếu không có
  const { tripId } = route?.params || { tripId: '1' };
  const insets = useSafeAreaInsets();

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Giả lập thời gian tải
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Dữ liệu giả lập (Mock Data) cho một hành trình đã lưu
  const mockTrip: TripData = {
    id: tripId,
    title: 'Hai Van Pass Loop',
    location: 'Da Nang, VN',
    coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800',
    description: 'Một chuyến đi tuyệt vời qua đèo Hải Vân, ngắm nhìn đại dương xanh ngắt và những đám mây trắng bồng bềnh trên đỉnh đèo.',
    schedules: [
      {
        id: '1',
        dateTime: '12/10 08:30',
        description: 'Bắt đầu khởi hành từ bãi biển Mỹ Khê, Đà Nẵng.',
      },
      {
        id: '2',
        dateTime: '12/10 10:00',
        description: 'Check-in tại Hải Vân Quan. Chụp ảnh với mây và sương mù.',
      },
      {
        id: '3',
        dateTime: '12/10 12:00',
        description: 'Ăn trưa tại Vịnh Lăng Cô, ngắm nhìn biển xanh.',
      }
    ]
  };

  const mockSnaps = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToCIk5-pWdysL0AOKI1zi8hp20jc__hI2p1f7S0oEvkTWSqhoCzzvwIq29&s=10',
    'https://cdn2.fptshop.com.vn/unsafe/800x0/den_voi_tam_dao_vinh_phuc_6_734ab33f30.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-HprWeValpVsrQLnQxOGVqtNgA1k1Wwrq7keZZyyUuJOF8yo8Vkl-JG-F&s=10',
    'https://luhanhvietnam.com.vn/du-lich/vnt_upload/news/02_2025/du_lich_hoa_binh_2_ngay_1_dem_mua_.jpg',
  ];

  return (
    <View style={styles.container}>
      {/* Nút Back nổi trên ảnh (Floating Header) */}
      <View style={[styles.header, { top: Math.max(insets.top, 16) }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable style={styles.iconButton} onPress={() => setEditModalVisible(true)}>
            <MaterialIcons name="edit" size={24} color={Colors.white} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <MaterialIcons name="share" size={24} color={Colors.white} />
          </Pressable>
        </View>
      </View>

      <FlatList 
        data={isLoading ? ['1', '2', '3', '4', '5', '6'] : mockSnaps}
        numColumns={3}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 80 }}
        ListHeaderComponent={
          <>
            {/* Ảnh bìa hành trình */}
            {isLoading ? (
              <Skeleton style={styles.coverImage} />
            ) : (
              <Image 
                source={mockTrip.coverImage} 
                style={styles.coverImage} 
                contentFit="cover" 
                transition={300}
              />
            )}
            
            {/* Khối thông tin chi tiết */}
            <View style={styles.infoContainer}>
              {isLoading ? (
                <>
                  <Skeleton style={{ height: 32, width: '80%', borderRadius: 8, marginBottom: 12 }} />
                  <Skeleton style={{ height: 20, width: '40%', borderRadius: 4, marginBottom: 20 }} />
                  <Skeleton style={{ height: 16, width: '100%', borderRadius: 4, marginBottom: 6 }} />
                  <Skeleton style={{ height: 16, width: '90%', borderRadius: 4, marginBottom: 6 }} />
                  <Skeleton style={{ height: 16, width: '70%', borderRadius: 4, marginBottom: 24 }} />
                  
                  <Skeleton style={{ height: 24, width: '50%', borderRadius: 6, marginBottom: 16 }} />
                  {[1, 2, 3].map(key => (
                    <View key={key} style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                      <Skeleton style={{ width: 12, height: 12, borderRadius: 6, marginTop: 4 }} />
                      <View style={{ flex: 1, gap: 8 }}>
                        <Skeleton style={{ height: 20, width: '30%', borderRadius: 4 }} />
                        <Skeleton style={{ height: 40, width: '100%', borderRadius: 8 }} />
                      </View>
                    </View>
                  ))}
                  <Skeleton style={{ height: 24, width: '50%', borderRadius: 6, marginBottom: 12 }} />
                </>
              ) : (
                <>
                  <Text style={styles.title}>{mockTrip.title}</Text>
                  <View style={styles.locationRow}>
                    <MaterialIcons name="location-on" size={16} color={Colors.primary} />
                    <Text style={styles.location}>{mockTrip.location}</Text>
                  </View>
                  <Text style={styles.description}>{mockTrip.description}</Text>
                  
                  {/* Lịch trình (Timeline) */}
                  <Text style={styles.sectionTitle}>Lịch trình chi tiết</Text>
                  <View style={styles.timeline}>
                    {mockTrip.schedules.map((schedule) => (
                      <View key={schedule.id} style={styles.dayContainer}>
                        {/* Đường kẻ dọc */}
                        <View style={styles.timelineLine} />
                        {/* Chấm tròn mốc thời gian */}
                        <View style={styles.timelineDot} />
                        
                        <View style={styles.dayContent}>
                          <Text style={styles.dayLabel}>{schedule.dateTime}</Text>
                          
                          <View style={styles.stopRow}>
                            <MaterialIcons name="directions-walk" size={14} color={Colors.textMuted} />
                            <Text style={styles.stopText}>{schedule.description}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  {/* Tiêu đề phần Hình ảnh */}
                  <Text style={[styles.sectionTitle, { marginTop: 12, marginBottom: 0 }]}>Hình ảnh chuyến đi</Text>
                </>
              )}
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          const gap = 2; // Khoảng cách giữa các ảnh
          const imageSize = (Value.widthScreen - (gap * 2)) / 3;
          
          if (isLoading) {
            return (
              <Skeleton 
                style={{
                  width: imageSize,
                  height: imageSize,
                  marginRight: (index + 1) % 3 !== 0 ? gap : 0,
                  marginBottom: gap,
                }} 
              />
            );
          }

          return (
            <Image 
              source={item as string} 
              style={{
                width: imageSize,
                height: imageSize,
                marginRight: (index + 1) % 3 !== 0 ? gap : 0,
                marginBottom: gap,
              }} 
              contentFit="cover" 
              transition={300} 
            />
          );
        }}
      />

      {/* Modal Chỉnh sửa chuyến đi */}
      <CreateTripModal 
        visible={isEditModalVisible} 
        onClose={() => setEditModalVisible(false)} 
        initialData={mockTrip} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
   
  },
  coverImage: {
    width: Value.widthScreen,
    height: 350,
  },
  infoContainer: {
    padding: 24,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30, // Tạo hiệu ứng khối thông tin đè lên ảnh
  },
  title: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  location: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 10,
  },
  dayContainer: {
    position: 'relative',
    paddingLeft: 24,
    paddingBottom: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 4,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  timelineDot: {
    position: 'absolute',
    left: -1,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  dayContent: {
    gap: 10,
  },
  dayLabel: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
  },
  stopText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
    flex: 1, // Để chữ tự động xuống dòng nếu quá dài
  },
});
