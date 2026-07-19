import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, Image, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { LocationJourneySelector } from './LocationJourneySelector';

export interface PhotoPreviewModalProps {
  visible: boolean;
  photoUri?: string;
  onClose: () => void;
  onRetake: () => void;
  onPost?: () => void;
}

export const PhotoPreviewModal = ({
  visible,
  photoUri,
  onClose,
  onRetake,
  onPost,
}: PhotoPreviewModalProps): React.JSX.Element => {
  const [shareToMap, setShareToMap] = useState<boolean>(true);
  const [selectedJourney, setSelectedJourney] = useState<string>('Hà Giang, Việt Nam 🏔️');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header Navigation */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.iconButton} hitSlop={8}>
            <Feather name="x" size={24} color={Colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Post Preview</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Main Content Area */}
        <View style={styles.content}>
          {/* Photo Card Container */}
          <View style={styles.imageCardContainer}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Feather name="image" size={48} color={Colors.textMuted} />
              </View>
            )}

            {/* Location Tag Badge Component */}
            <View style={styles.locationBadgeWrapper}>
              <LocationJourneySelector
                selectedJourney={selectedJourney}
                onSelectJourney={setSelectedJourney}
              />
            </View>
          </View>

          {/* Post Details & Map Toggle Option */}
          <View style={styles.detailsCard}>
            <View style={styles.optionRow}>
              <View style={styles.optionTextContainer}>
                <View style={styles.labelWithIcon}>
                  <MaterialCommunityIcons name="map-marker-path" size={18} color={Colors.primary} />
                  <Text style={styles.optionTitle}>Chia sẻ lên Bản đồ Bước chân</Text>
                </View>
                <Text style={styles.optionSubtitle}>
                  Cho phép bạn bè khám phá địa điểm đẹp này của bạn
                </Text>
              </View>
              <Switch
                value={shareToMap}
                onValueChange={setShareToMap}
                trackColor={{ false: '#3A3A3C', true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>
        </View>

        {/* Bottom Action Footer */}
        <View style={styles.footer}>
          <Pressable
            onPress={onRetake}
            style={[styles.actionButton, styles.retakeButton]}
          >
            <Feather name="rotate-ccw" size={18} color={Colors.white} />
            <Text style={styles.retakeText}>Chụp lại</Text>
          </Pressable>

          <Pressable
            onPress={onPost || onClose}
            style={[styles.actionButton, styles.postButton]}
          >
            <Feather name="send" size={18} color={Colors.black} />
            <Text style={styles.postText}>Đăng ảnh</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F1417',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  imageCardContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E252B',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationBadgeWrapper: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  detailsCard: {
    backgroundColor: '#1E252B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionTextContainer: {
    flex: 1,
    gap: 4,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 28,
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  postButton: {
    backgroundColor: Colors.primary,
  },
  retakeText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  postText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: '700',
  },
});
