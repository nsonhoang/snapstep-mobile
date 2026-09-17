import { useState, useEffect } from 'react';

/**
 * Custom Hook hoãn (debounce) giá trị sau một khoảng thời gian chờ nhất định.
 * Giúp giảm thiểu số lượng request API và chống rate limit khi người dùng nhập liệu liên tục.
 *
 * @param value Giá trị cần debounce (generic type T)
 * @param delay Thời gian chờ tính theo ms (mặc định 400ms)
 * @returns Giá trị sau khi đã debounce
 */
export const useDebounce = <T>(value: T, delay: number = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
