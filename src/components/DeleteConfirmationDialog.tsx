/**
 * DeleteConfirmationDialog — mirrors DeleteConfirmationDialog.kt.
 *
 * AlertDialog with title, message, Confirm (destructive red), and Cancel.
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { lightColors, spacing, borderRadii } from '../theme/theme';

interface DeleteConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export default function DeleteConfirmationDialog({
  visible,
  title,
  message,
  onConfirm,
  onDismiss,
}: DeleteConfirmationDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onDismiss}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  dialog: {
    width: '100%',
    backgroundColor: lightColors.surface,
    borderRadius: borderRadii.lg,
    padding: spacing.xxl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: lightColors.onSurface,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: 14,
    color: lightColors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadii.md,
    borderWidth: 1,
    borderColor: lightColors.outline,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.onSurface,
  },
  confirmButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadii.md,
    backgroundColor: lightColors.error,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
