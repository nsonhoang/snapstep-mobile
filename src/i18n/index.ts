import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage, TranslationSchema } from './types';
import { vi } from './locales/vi';
import { en } from './locales/en';

const STORAGE_KEY = '@snapstep_language';

// Bảng ánh xạ các gói ngôn ngữ được hỗ trợ
const dictionaries: Record<SupportedLanguage, TranslationSchema> = {
  vi,
  en,
};

interface I18nState {
  language: SupportedLanguage;
  t: TranslationSchema;
  isInitialized: boolean;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  initLanguage: () => Promise<void>;
}

/**
 * Hook quản lý đa ngôn ngữ i18n toàn cục
 * - t: Đối tượng từ điển chứa toàn bộ chuỗi ký tự theo ngôn ngữ hiện tại (100% Type-Safe)
 * - language: Mã ngôn ngữ hiện tại ('vi' | 'en')
 * - setLanguage: Hàm chuyển đổi ngôn ngữ và tự động lưu vào AsyncStorage
 */
export const useTranslation = create<I18nState>((set) => ({
  language: 'vi',
  t: vi,
  isInitialized: false,

  setLanguage: async (lang: SupportedLanguage) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.error('Lỗi khi lưu tùy chọn ngôn ngữ:', error);
    }
    set({
      language: lang,
      t: dictionaries[lang] || vi,
    });
  },

  initLanguage: async () => {
    try {
      const savedLang = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLang === 'vi' || savedLang === 'en') {
        set({
          language: savedLang,
          t: dictionaries[savedLang],
          isInitialized: true,
        });
        return;
      }
    } catch (error) {
      console.error('Lỗi khi đọc ngôn ngữ đã lưu:', error);
    }
    set({ isInitialized: true });
  },
}));

// Khởi chạy nạp ngôn ngữ đã lưu ngay lập tức
useTranslation.getState().initLanguage();

export * from './types';
