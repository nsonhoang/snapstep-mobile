import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  User,
} from "@react-native-firebase/auth";
import { create } from "zustand";
import { useTripStore } from "./tripStore";

interface AuthContextType {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  reloadUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthContextType>((set, get) => ({
  user: null,
  initializing: true,
  login: async (email: string, pass: string) => {
    signInWithEmailAndPassword(getAuth(), email, pass)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User logged in!", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error logging in:", errorCode, errorMessage);
      });
  },
  register: async (email: string, password: string) => {
    createUserWithEmailAndPassword(getAuth(), email, password)
      .then(async () => {
        console.log("User account created & signed in!");

        const newUser = getAuth().currentUser;
        console.log("đăng ký " + newUser?.email);

        if (newUser && !newUser.emailVerified) {
          await sendEmailVerification(newUser);
          console.log("Đã gửi email xác thực đến:", newUser.email);
        }
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          console.log("That email address is already in use!");
        }
        if (error.code === "auth/invalid-email") {
          console.log("That email address is invalid!");
        }
        console.error(error);
      });
  },
  logout: async () => {
    useTripStore.setState({
      trips: [],
      selectedTripId: null,
      lastDoc: null,
    });

    await getAuth().signOut();
    console.log("User logged out!");
  },
  reloadUser: async () => {
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      await currentUser.reload();

      if (currentUser.emailVerified) {
        const currentUserState = get().user;
        set({
          user: {
            ...currentUserState,
            emailVerified: currentUser.emailVerified,
          } as User,
        }); // vì useState là bất đồng bộ để như thế này userVerify vấn là false , phải nhấn lần 2 mới là true
      }

      console.log("User reloaded!" + currentUser.emailVerified);
      // Tạo một object copy mới để ép React cập nhật giao diện

      console.log("User reloaded! lan 2" + get().user?.emailVerified);
    }
  },
}));

onAuthStateChanged(getAuth(), (currentUser) => {
  // Hàm setState() của Zustand cho phép ta "bơm" dữ liệu thẳng vào Store
  // từ bên ngoài mà không cần định nghĩa hàm setUser.
  useAuthStore.setState({
    user: currentUser,
    initializing: false,
  });
});
