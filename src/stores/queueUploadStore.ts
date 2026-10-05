import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// 1. Trạng thái của một bài đăng trong hàng đợi
export type UploadStatus = "pending" | "uploading" | "success" | "failed";

export interface UploadTask {
  id: string; // Mã định danh duy nhất (dùng Date.now().toString())
  userId: string;
  photoUri: string;
  caption: string;
  tripId: string;
  location: any;
  shareToMap: boolean;
  status: UploadStatus;
  progress: number; // Tiến độ từ 0 -> 100%
  errorMessage?: string;
  createdAt: number;
}
interface UploadQueueState {
  tasks: UploadTask[];
  isProcessing: boolean;
  addTask: (
    taskData: Omit<UploadTask, "id" | "status" | "progress" | "createdAt">,
  ) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  updateTaskStatus: (
    taskId: string,
    status: UploadStatus,
    errorMessage?: string,
  ) => void;
  removeTask: (taskId: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
}
export const useUploadQueueStore = create<UploadQueueState>()(
  persist(
    (set) => ({
      tasks: [],
      isProcessing: false,

      addTask: (taskData) => {
        const newTask: UploadTask = {
          ...taskData,
          id: Date.now().toString(),
          status: "pending",
          progress: 0,
          createdAt: Date.now(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },
      // Cập nhật tiến trình % của task
      updateTaskProgress: (id, progress) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id == id ? { ...t, progress: progress } : t,
          ),
        }));
      },
      updateTaskStatus: (taskId, status, errorMessage) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status, errorMessage } : t,
          ),
        }));
      },
      removeTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
      },
      setIsProcessing: (isProcessing) => set({ isProcessing }),
    }),
    {
      name: "@snapstep_upload_queue",
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ lưu danh sách tasks, không lưu trạng thái đang chạy isProcessing
      partialize: (state) => ({ tasks: state.tasks }),
    },
  ),
);
