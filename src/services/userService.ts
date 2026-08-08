import { FieldValue, Timestamp } from "@react-native-firebase/firestore";

export interface User {
    firstName: string,
    lastName: string,
    email: string,
    createdAt: Timestamp | FieldValue,
    updatedAt: Timestamp | FieldValue,
    ghostMode: boolean,
    stats:UserStats
    avatarUrl?:string,
 conqueredProvinces?: Record<string, ProvinceInfo>;
}

export interface UserStats {
  conqueredProvincesCount: number;
  totalPhotosCount: number;
}


export interface ProvinceInfo {
  unlockedAt: Timestamp | FieldValue;
  firstPhotoId: string;
}

