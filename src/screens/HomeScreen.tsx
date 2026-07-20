import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Pressable, Text, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../navigation/AuthContext';
import { HomeScreenProps } from '../navigation/types';
import { Colors } from '../constants/Colors';
import { useAlert } from '../components/AlertProvider';
import { CameraHeader } from '../components/CameraHeader';

import { CameraToggles } from '../components/CameraToggles';
import { CaptureBar } from '../components/CaptureBar';
import { PhotoPreviewModal } from '../components/PhotoPreviewModal';
import { useCameraPermissions, CameraType, CameraView } from 'expo-camera'; // sẽ thay thế bằng thư viện react-native-vision-camera để cải tiếng

export const HomeScreen = ({ navigation }: HomeScreenProps): React.JSX.Element => {
const [permission, requestPermission] = useCameraPermissions();
const [facing, setFacing] = useState<CameraType>('back');
const cameraRef = useRef<CameraView>(null);

  const { logout } = useAuth();
  const { showAlert } = useAlert();

  const [isGhostModeOn, setIsGhostModeOn] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('Besties 💖');
  const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('off');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | undefined>(undefined);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // chuyển sang camera trước
  const flipCamera = () => {
    setFacing(prevFacing => (prevFacing === 'back' ? 'front' : 'back'));
  };


  // bật flash
  const toggleFlash = () => {
    setFlashMode((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };
  const handleBackPress = (): void => {
    navigation.navigate('MainTabs', { screen: 'Explore' });
  };

  const handleSettingsPress = (): void => {
    showAlert({
      title: 'Cài đặt SnapStep',
      message: 'Bạn có muốn mở Cài đặt hay Đăng xuất?',
      type: 'info',
      confirmText: 'Đăng xuất',
      cancelText: 'Đóng',
      onConfirm: logout,
    });
  };

  const handleGroupPress = (): void => {
    const groups = ['Besties 💖', 'Travel Buddies ✈️', 'Family 🏡', 'Solo Explorer 🧭'];
    const currentIndex = groups.indexOf(selectedGroup);
    const nextGroup = groups[(currentIndex + 1) % groups.length];
    setSelectedGroup(nextGroup);
    showAlert({
      title: 'Đã chuyển nhóm',
      message: `Đã đổi sang nhóm chia sẻ: ${nextGroup}`,
      type: 'success',
    });
  };

  //chụp ảnh
  const handleShutterPress = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
        });
        if (photo?.uri) {
          console.log('Đã chụp ảnh, đường dẫn:', photo.uri);
          setCapturedPhotoUri(photo.uri);
          setIsPreviewVisible(true);
        }
      } catch (error) {
        console.error('Lỗi khi chụp ảnh:', error);
      }
    }
  };

  const handleThumbnailPress = (): void => {
    if (capturedPhotoUri) {
      setIsPreviewVisible(true);
    } else {
      showAlert({
        title: 'Thư viện hành trình',
        message: 'Chưa có ảnh mới. Hãy bấm nút chụp để chụp bức ảnh đầu tiên!',
        type: 'info',
      });
    }
  };

  // Trạng thái 1: Đang khởi tạo hoặc chưa có kết quả xin quyền
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Đang khởi tạo Camera...</Text>
      </View>
    );
  }

  // Trạng thái 2: Người dùng chưa cấp quyền hoặc đã từ chối
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Chúng tôi cần quyền sử dụng Camera của bạn</Text>
        <Pressable  onPress={requestPermission}>
          <Text >Cấp Quyền</Text>
        </Pressable>
      </View>
    );
  }


  return (
    <View style={styles.screenBackground}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <SafeAreaView style={styles.safeArea}>
          
          {/* 1. Header Navigation Component */}
          <CameraHeader
            selectedGroup={selectedGroup}
            onBackPress={handleBackPress}
            onGroupPress={handleGroupPress}
            onSettingsPress={handleSettingsPress}
          />

          {/* 2. Camera Viewport Component */}
         <View style={styles.previewContainer}>
          <CameraView 
            ref={cameraRef} 
            style={{ flex: 1 }}
            facing={facing}
            flash={flashMode}
            // enableTorch={flashMode === 'on'}
            autofocus="on"
            
          />
         </View>

          {/* 3. Camera Controls / Toggles Component */}
          <CameraToggles
            isFlashOn={flashMode}
            isGhostModeOn={isGhostModeOn}
            onToggleFlash={toggleFlash}
            onFlipCamera={flipCamera}
            onToggleGhostMode={() => {
              setIsGhostModeOn(!isGhostModeOn);
              showAlert({
                title: 'Ghost Mode',
                message: !isGhostModeOn
                  ? 'Chế độ Ẩn danh (Ghost Mode) đã BẬT'
                  : 'Chế độ Ẩn danh (Ghost Mode) đã TẮT',
                type: !isGhostModeOn ? 'success' : 'info',
              });
            }}
          />

          {/* 4. Bottom Capture Bar Component */}
          <CaptureBar
            thumbnailUri={capturedPhotoUri}
            onShutterPress={handleShutterPress}
            onThumbnailPress={handleThumbnailPress}
          />
        </SafeAreaView>
   
      </Animated.View>

      {/* Full Photo Inspection & Post Preview Modal */}
      <PhotoPreviewModal
        visible={isPreviewVisible}
        photoUri={capturedPhotoUri}
        onClose={() => setIsPreviewVisible(false)}
        onRetake={() => {
          setCapturedPhotoUri(undefined);
          setIsPreviewVisible(false);
        }}
        onPost={() => {
          setIsPreviewVisible(false);
          showAlert({
            title: 'Đăng ảnh thành công!',
            message: 'Ảnh đã được chia sẻ lên Bản đồ Bước chân.',
            type: 'success',
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenBackground: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  safeArea: {
    flex: 1,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 8,
  },
});
