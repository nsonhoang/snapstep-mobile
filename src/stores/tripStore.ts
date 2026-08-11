import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DocumentSnapshot } from "@react-native-firebase/firestore";
import { TripWithId, TripService } from "../services/tripService";

interface TripState {
  trips: TripWithId[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  lastDoc: DocumentSnapshot | null;
  selectedTripId: string | null;
  setSelectedTripId: (id: string | null) => void;
  fetchTrips: (userId?: string) => Promise<void>;
  fetchMoreTrips: (userId?: string) => Promise<void>;
}

const TRIPS_PER_PAGE = 10;

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      isLoading: false,
      isFetchingMore: false,
      hasMore: true,
      lastDoc: null,
      selectedTripId: null,

      setSelectedTripId: (id) => set({ selectedTripId: id }),

      fetchTrips: async (userId?: string) => {
        set({ isLoading: true, hasMore: true });
        try {
          const { trips, lastDoc } = await TripService.getTrips(
            TRIPS_PER_PAGE,
            userId,
          );

          set({
            trips,
            isLoading: false,
            lastDoc,
            hasMore: trips.length === TRIPS_PER_PAGE,
          });
        } catch (error) {
          console.error("Lỗi khi tải Trips:", error);
          set({ isLoading: false });
        }
      },

      fetchMoreTrips: async (userId?: string) => {
        const { isFetchingMore, hasMore, lastDoc, trips } = get();

        if (isFetchingMore || !hasMore || !lastDoc) return;

        set({ isFetchingMore: true });
        try {
          const { trips: newTrips, lastDoc: newLastDoc } =
            await TripService.getMoreTrips(TRIPS_PER_PAGE, lastDoc, userId);

          set({
            trips: [...trips, ...newTrips],
            isFetchingMore: false,
            lastDoc: newLastDoc,
            hasMore: newTrips.length === TRIPS_PER_PAGE,
          });
        } catch (error) {
          console.error("Lỗi khi tải thêm Trips:", error);
          set({ isFetchingMore: false });
        }
      },
    }),
    {
      name: "trip-storage", // Tên key lưu trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // CHỈ LƯU selectedTripId xuống máy, bỏ qua các biến khác (trips, isLoading...)
      partialize: (state) => ({ selectedTripId: state.selectedTripId }),
    },
  ),
);
