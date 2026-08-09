import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { useAlert } from "./AlertProvider";
import { CreateTripModal } from "./CreateTripModal";
import { useTripStore } from "../stores/tripStore";
import { useAuthStore } from "../stores/authStore";

export interface LocationJourneySelectorProps {
  selectedJourney?: string;
  onSelectJourney?: (journey: string) => void;
}

export const LocationJourneySelector = ({
  selectedJourney = "Hà Giang, Việt Nam 🏔️",
  onSelectJourney,
}: LocationJourneySelectorProps): React.JSX.Element => {
  const [currentJourney, setCurrentJourney] = useState<string>(selectedJourney);
  const { trips, fetchTrips } = useTripStore();
  const { user } = useAuthStore();

  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  const [showCreateTripModal, setShowCreateTripModal] =
    useState<boolean>(false);

  useEffect(() => {
    if (user?.uid && trips.length === 0) {
      fetchTrips(user.uid);
    }
  }, [user]);

  const handleSelect = (journey: string, id: string) => {
    setCurrentJourney(journey);
    onSelectJourney?.(journey);
    setIsMenuVisible(false);
  };

  const handleAddNewJourney = () => {
    // setIsMenuVisible(false);
    setShowCreateTripModal(true);
  };

  return (
    <>
      {/* Location Badge Button */}
      <View style={styles.locationBadgeContainer}>
        <Pressable
          onPress={() => setIsMenuVisible(true)}
          style={styles.locationBadgePressable}
          hitSlop={8}
        >
          <Ionicons name="location-sharp" size={15} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {currentJourney}
          </Text>
          <Feather name="chevron-down" size={14} color={Colors.white} />
        </Pressable>
      </View>

      {/* Journey Selection Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <View style={styles.menuTitleRow}>
                <Ionicons name="map-outline" size={18} color={Colors.primary} />
                <Text style={styles.menuTitle}>Chọn điểm hành trình</Text>
              </View>
              <Pressable
                onPress={() => setIsMenuVisible(false)}
                style={styles.closeButton}
                hitSlop={6}
              >
                <Feather name="x" size={18} color={Colors.white} />
              </Pressable>
            </View>

            {/* List of Journeys */}
            <FlatList
              data={trips}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => {
                const isSelected = item.id === currentJourney;
                return (
                  <Pressable
                    onPress={() => handleSelect(item.title, item.id)}
                    style={[
                      styles.journeyItem,
                      isSelected && styles.journeyItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.journeyItemText,
                        isSelected && styles.journeyItemTextSelected,
                      ]}
                    >
                      {item.title}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={16} color={Colors.primary} />
                    )}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* Add New Journey Button */}
            <Pressable
              onPress={handleAddNewJourney}
              style={styles.addJourneyButton}
            >
              <Feather name="plus-circle" size={18} color={Colors.primary} />
              <Text style={styles.addJourneyText}>Thêm hành trình mới</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <CreateTripModal
        visible={showCreateTripModal}
        onClose={() => setShowCreateTripModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  locationBadgeContainer: {
    backgroundColor: "rgba(15, 20, 23, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(112, 194, 180, 0.35)",
  },
  locationBadgePressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  menuContainer: {
    width: "100%",
    maxHeight: 360,
    backgroundColor: "#1E252B",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  menuTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  journeyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  journeyItemSelected: {
    backgroundColor: "rgba(112, 194, 180, 0.12)",
  },
  journeyItemText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  journeyItemTextSelected: {
    color: Colors.white,
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  addJourneyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(112, 194, 180, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(112, 194, 180, 0.3)",
  },
  addJourneyText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
