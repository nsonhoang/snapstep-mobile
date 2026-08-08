import { FieldValue, Timestamp } from "@react-native-firebase/firestore";

export interface Trip {
  userId: string;
  title: string;
  like: number;
  love: number;
  hate: number;
  likeUser: Set<string>; // user id đã like
  loveUser: Set<string>;
  hateUser: Set<string>;
  description?: string;
  coverImageUrl?: string;
  //   member:{} tương lai
  // detail : Record<string,string> // key: là timestamp
  details: TripDetail[];
  postIds: string[];
  status: TripStatus;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

type TripStatus = "planning" | "ongoing" | "completed";

export interface TripDetail {
  //   provinceCode: string; tương lai nếu muốn chia sẻ hành trình này cho người khác
  //   locationName: string; tương lai nếu muốn chia sẻ hành trình này cho người khác
  time: Timestamp;
  describe: string;
}
