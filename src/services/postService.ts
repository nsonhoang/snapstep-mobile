import { FieldValue, Timestamp } from "@react-native-firebase/firestore";

interface Post {
  authorId: string; // sẽ gán băng userId
  imageUrl: string; //
  thumbnailUrl: string; // Dùng vẽ Marker trên Map cho nhẹ
  caption: string;
  tripId?: string;
  location: Location;
  createdAt: Timestamp | FieldValue;
  updateAt: Timestamp | FieldValue;
}

export interface Location {
  latitude: number;
  longitude: number;
  provinceCode: string;
  provinceName: string;
  placeName: string;
}
