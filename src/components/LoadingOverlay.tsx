import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AppText from './AppText';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message }) => {
  // Hardcode colors since useTheme() causes issues when rendered outside NavigationContainer
  const backgroundColor = '#ffffff'; // Default light background
  const indicatorColor = '#3b82f6'; // Primary blue
  const textColor = '#1e293b'; // Dark text

  if (!isLoading) {
    return null;
  }

  return (
    <View style={[styles.overlay, { backgroundColor: backgroundColor }]}>
      <ActivityIndicator size="large" color={indicatorColor} />
      {message && <AppText weight="bold" style={[styles.message, { color: textColor }]}>{message}</AppText>}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  message: {
    marginTop: 15,
    fontSize: 16,
  },
});

export default LoadingOverlay;