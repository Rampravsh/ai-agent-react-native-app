/**
 * EditAgentModal Component
 *
 * Minimalist agent personalization modal:
 * - Avatar preview
 * - Agent Name input
 * - Color accent selector
 * - Clean Save & Cancel actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { Colors } from '@/constants/colors';
import MascotAvatar from './MascotAvatar';
import { showToast } from '@/context/ToastContext';
import { AgentProfile } from '@/types';

export interface EditAgentModalProps {
  visible: boolean;
  initialName: string;
  initialSubtitle?: string;
  initialIcon?: string;
  initialColor?: string;
  onClose: () => void;
  onSave: (data: AgentProfile) => void;
}

const THEME_COLORS = [
  '#2563EB', // Muse Blue
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#E11D48', // Rose
];

export const EditAgentModal: React.FC<EditAgentModalProps> = ({
  visible,
  initialName,
  initialSubtitle = 'Autonomous Agent',
  initialIcon = 'cooper',
  initialColor = Colors.primary,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialName);
  const [selectedColor, setSelectedColor] = useState(initialColor);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setSelectedColor(initialColor);
    }
  }, [visible, initialName, initialColor]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    onSave({
      name: trimmed,
      subtitle: initialSubtitle,
      icon: initialIcon,
      color: selectedColor,
    });
    showToast('Agent updated');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                {/* Header with Close */}
                <View style={styles.header}>
                  <Text style={styles.title}>Edit Agent</Text>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose}
                    activeOpacity={0.7}>
                    <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.iconMuted} />
                  </TouchableOpacity>
                </View>

                {/* Avatar Preview */}
                <View style={styles.avatarSection}>
                  <MascotAvatar size={64} />
                </View>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Agent name"
                    placeholderTextColor={Colors.iconMuted}
                    maxLength={30}
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                  />
                </View>

                {/* Theme Color Dots */}
                <View style={styles.colorGroup}>
                  <Text style={styles.label}>Theme</Text>
                  <View style={styles.colorRow}>
                    {THEME_COLORS.map((color) => {
                      const isSelected = selectedColor === color;
                      return (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorDot,
                            { backgroundColor: color },
                            isSelected && styles.colorDotSelected,
                          ]}
                          onPress={() => setSelectedColor(color)}
                          activeOpacity={0.8}>
                          {isSelected && (
                            <HugeiconsIcon
                              icon={CheckmarkCircle02Icon}
                              size={14}
                              color={Colors.white}
                              strokeWidth={2.5}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onClose}
                    activeOpacity={0.7}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: selectedColor }]}
                    onPress={handleSave}
                    activeOpacity={0.8}>
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  keyboardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.iconDark,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  inputGroup: {
    marginTop: 12,
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.iconMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.iconDark,
    borderWidth: 1,
    borderColor: '#ECEEF0',
  },
  colorGroup: {
    marginBottom: 20,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 2.5,
    borderColor: Colors.white,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.iconDark,
  },
  saveBtn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default EditAgentModal;
