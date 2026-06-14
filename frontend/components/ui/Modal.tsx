import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function CustomModal({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Batal',
}: CustomModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.icon}>{getIcon()}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.btnWrapper}>
            {onConfirm && (
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={onClose}
              >
                <Text style={styles.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.btn,
                type === 'success' ? styles.btnSuccess : styles.btnPrimary,
                onConfirm && { flex: 1 }
              ]}
              onPress={onConfirm || onClose}
            >
              <Text style={styles.btnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btnWrapper: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnSuccess: {
    backgroundColor: Colors.orange,
  },
  btnCancel: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnCancelText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
