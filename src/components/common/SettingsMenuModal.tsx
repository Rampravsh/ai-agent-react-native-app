/**
 * SettingsMenuModal Component
 *
 * Floating dropdown action sheet anchored to the top-right 3-dots header button.
 * Provides quick actions:
 * 1. Edit Mascot & Avatar
 * 2. Rename Agent
 * 3. Export / Share Chat
 * 4. Clear Messages
 * 5. Delete Chat Session (Destructive)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Edit01Icon,
  Delete02Icon,
  Share01Icon,
  SparklesIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import { Colors } from '@/constants/colors';
import { showToast } from '@/context/ToastContext';

export interface SettingsMenuModalProps {
  /** Visibility state of the dropdown overlay */
  visible: boolean;
  /** Callback fired to close the dropdown menu */
  onClose: () => void;
  /** Callback to launch the agent customization modal */
  onEditAvatar: () => void;
  /** Callback to launch agent rename */
  onRename: () => void;
  /** Callback to reset conversation messages */
  onClearChat: () => void;
  /** Destructive callback to wipe active session */
  onDeleteChat: () => void;
  /** Callback to export or share conversation transcript */
  onShareChat?: () => void;
}

/**
 * Top-Right 3-Dots Action Sheet Dropdown
 */
export const SettingsMenuModal: React.FC<SettingsMenuModalProps> = ({
  visible,
  onClose,
  onEditAvatar,
  onRename,
  onClearChat,
  onDeleteChat,
  onShareChat,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[
            styles.overlay,
            { paddingTop: Math.max(insets.top, 12) + (Platform.OS === 'web' ? 54 : 50) },
          ]}>
          <TouchableWithoutFeedback>
            <View style={styles.dropdownCard}>
              {/* 1. Edit Mascot & Avatar */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  showToast('Edit Mascot & Avatar');
                  onClose();
                  onEditAvatar();
                }}
                activeOpacity={0.7}>
                <HugeiconsIcon
                  icon={SparklesIcon}
                  size={18}
                  color={Colors.iconDark}
                  strokeWidth={1.8}
                />
                <Text style={styles.itemText}>Edit Mascot & Avatar</Text>
              </TouchableOpacity>

              {/* 2. Rename Agent / Chat */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  showToast('Rename Agent');
                  onClose();
                  onRename();
                }}
                activeOpacity={0.7}>
                <HugeiconsIcon
                  icon={Edit01Icon}
                  size={18}
                  color={Colors.iconDark}
                  strokeWidth={1.8}
                />
                <Text style={styles.itemText}>Rename Agent</Text>
              </TouchableOpacity>

              {/* 3. Export Conversation */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  showToast('Export Chat');
                  onClose();
                  onShareChat?.();
                }}
                activeOpacity={0.7}>
                <HugeiconsIcon
                  icon={Share01Icon}
                  size={18}
                  color={Colors.iconDark}
                  strokeWidth={1.8}
                />
                <Text style={styles.itemText}>Export Chat</Text>
              </TouchableOpacity>

              {/* 4. Clear Messages */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  showToast('Clear Messages');
                  onClose();
                  onClearChat();
                }}
                activeOpacity={0.7}>
                <HugeiconsIcon
                  icon={RefreshIcon}
                  size={18}
                  color={Colors.iconDark}
                  strokeWidth={1.8}
                />
                <Text style={styles.itemText}>Clear Messages</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* 5. Delete Chat (Destructive) */}
              <TouchableOpacity
                style={[styles.menuItem, styles.dangerItem]}
                onPress={() => {
                  showToast('Delete Chat');
                  onClose();
                  onDeleteChat();
                }}
                activeOpacity={0.7}>
                <HugeiconsIcon
                  icon={Delete02Icon}
                  size={18}
                  color={Colors.error}
                  strokeWidth={1.8}
                />
                <Text style={[styles.itemText, styles.dangerText]}>Delete Chat</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 64 : 56,
    paddingRight: 16,
  },
  dropdownCard: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04)',
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 9,
    gap: 10,
  },
  dangerItem: {
    marginTop: 1,
  },
  itemText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  dangerText: {
    color: Colors.error,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
    marginHorizontal: 6,
  },
});

export default SettingsMenuModal;
