/**
 * FullScreenLoadingIndicator — mirrors FullScreenLoadingIndicator.kt.
 *
 * Centered ActivityIndicator inside a full-screen container.
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { lightColors } from '../theme/theme';

interface Props {
  color?: string;
}

export default function FullScreenLoadingIndicator({
  color = lightColors.primary,
}: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightColors.background,
  },
});
