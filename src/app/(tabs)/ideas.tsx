/**
 * Ideas Tab Screen ('/(tabs)/ideas')
 *
 * Inspiration feed showcasing pre-built autonomous agent task templates.
 * On-click triggers simple Toast notifications.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { IDEA_ITEMS } from '@/constants/dummyData';
import { showToast } from '@/context/ToastContext';

export default function IdeasScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={styles.titleWrapper}>
          <Text style={styles.pageTitle}>Ideas</Text>
        </View>

        {/* Ideas List */}
        {IDEA_ITEMS.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity
              style={styles.ideaRow}
              onPress={() => showToast(`Selected: ${item.title}`)}
              activeOpacity={0.75}>
              {/* 3D Emoji Icon Badge */}
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>{item.icon}</Text>
              </View>

              {/* Title & Description */}
              <View style={styles.textContainer}>
                <Text style={styles.ideaTitle}>{item.title}</Text>
                <Text style={styles.ideaDescription} numberOfLines={4}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>

            {index < IDEA_ITEMS.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  titleWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.iconDark,
    letterSpacing: -0.5,
  },
  ideaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  iconEmoji: {
    fontSize: 34,
  },
  textContainer: {
    flex: 1,
  },
  ideaTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: Colors.iconDark,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  ideaDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#707070',
    lineHeight: 20,
    marginTop: 6,
    letterSpacing: -0.1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F2',
    marginHorizontal: 20,
  },
});
