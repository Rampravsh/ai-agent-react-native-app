/**
 * MascotAvatar Component
 *
 * Simple 3D character mascot avatar portrait.
 */

import React from 'react';
import { Image, StyleSheet, ImageStyle, StyleProp } from 'react-native';

export interface MascotAvatarProps {
  /** Avatar diameter in pixels (defaults to 54) */
  size?: number;
  /** Optional custom image style */
  style?: StyleProp<ImageStyle>;
}

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  size = 54,
  style,
}) => {
  return (
    <Image
      source={require('../../../assets/images/cooper_mascot.jpg')}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#F3F4F6',
  },
});

export default MascotAvatar;

