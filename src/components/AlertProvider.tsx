import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextProps {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = (): AlertContextProps => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider = ({ children }: AlertProviderProps): React.JSX.Element => {
  const [visible, setVisible] = useState<boolean>(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const showAlert = (newOptions: AlertOptions) => {
    setOptions(newOptions);
    setVisible(true);

    scaleAnim.setValue(0.85);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideAlert = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setOptions(null);
      if (callback) callback();
    });
  };

  const handleConfirm = () => {
    if (options?.onConfirm) {
      hideAlert(() => options.onConfirm?.());
    } else {
      hideAlert();
    }
  };

  const handleCancel = () => {
    if (options?.onCancel) {
      hideAlert(() => options.onCancel?.());
    } else {
      hideAlert();
    }
  };

  const getIconConfig = (type: AlertType = 'info') => {
    switch (type) {
      case 'success':
        return { name: 'check-circle' as const, color: '#70C2B4', bg: 'rgba(112, 194, 180, 0.15)' };
      case 'error':
        return { name: 'alert-octagon' as const, color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.15)' };
      case 'warning':
        return { name: 'alert-triangle' as const, color: '#FFD166', bg: 'rgba(255, 209, 102, 0.15)' };
      case 'info':
      default:
        return { name: 'info' as const, color: '#4EA8DE', bg: 'rgba(78, 168, 222, 0.15)' };
    }
  };

  const iconConfig = options ? getIconConfig(options.type) : null;

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {visible && options && iconConfig && (
        <Modal
          transparent
          visible={visible}
          animationType="none"
          onRequestClose={() => hideAlert()}
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modalCard,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Alert Header Icon */}
              <View style={[styles.iconWrapper, { backgroundColor: iconConfig.bg }]}>
                <Feather name={iconConfig.name} size={32} color={iconConfig.color} />
              </View>

              {/* Text content */}
              <Text style={styles.titleText}>{options.title}</Text>
              <Text style={styles.messageText}>{options.message}</Text>

              {/* Action buttons */}
              <View style={styles.buttonContainer}>
                {options.onCancel || options.cancelText ? (
                  <>
                    <Pressable
                      style={({ pressed }) => [
                        styles.cancelButton,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={handleCancel}
                    >
                      <Text style={styles.cancelButtonText}>
                        {options.cancelText || 'Cancel'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.confirmButton,
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={handleConfirm}
                    >
                      <Text style={styles.confirmButtonText}>
                        {options.confirmText || 'Confirm'}
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={({ pressed }) => [
                      styles.singleConfirmButton,
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>
                      {options.confirmText || 'OK'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </AlertContext.Provider>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 15, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalCard: {
    width: Math.min(width - 60, 340),
    backgroundColor: '#15181F',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleConfirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#0D0D0D',
    fontSize: 14,
    fontWeight: '700',
  },
});
