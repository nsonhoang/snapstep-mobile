import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import { CustomInput } from './CustomInput';

export interface EditProfileFormProps {
  lastName: string;
  onChangeLastName: (text: string) => void;
  firstName: string;
  onChangeFirstName: (text: string) => void;
  username: string;
  onChangeUsername: (text: string) => void;
  bio: string;
  onChangeBio: (text: string) => void;
}

/**
 * Component Form nhập thông tin cá nhân: Họ & tên đệm, Tên, Username, Tiểu sử
 */
export const EditProfileForm = ({
  lastName,
  onChangeLastName,
  firstName,
  onChangeFirstName,
  username,
  onChangeUsername,
  bio,
  onChangeBio,
}: EditProfileFormProps): React.JSX.Element => {
  return (
    <View style={styles.formSection}>
      <View style={styles.nameRow}>
        {/* Ô nhập Họ & tên đệm */}
        <View style={styles.halfInput}>
          <Text style={styles.label}>Họ & tên đệm</Text>
          <CustomInput
            value={lastName}
            onChangeText={onChangeLastName}
            placeholder="Nhập họ & tên đệm"
          />
        </View>

        {/* Ô nhập Tên */}
        <View style={styles.halfInput}>
          <Text style={styles.label}>Tên</Text>
          <CustomInput
            value={firstName}
            onChangeText={onChangeFirstName}
            placeholder="Nhập tên"
          />
        </View>
      </View>

      {/* Ô nhập Tên người dùng */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tên người dùng (Username)</Text>
        <CustomInput
          value={username}
          onChangeText={onChangeUsername}
          placeholder="Nhập tên người dùng"
          autoCapitalize="none"
        />
      </View>

      {/* Ô nhập Tiểu sử */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tiểu sử</Text>
        <CustomInput
          style={styles.textArea}
          value={bio}
          onChangeText={onChangeBio}
          placeholder="Giới thiệu về bạn..."
          multiline
          maxLength={150}
        />
        <Text style={styles.charCount}>{bio.length}/150</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 16,
  },
});
