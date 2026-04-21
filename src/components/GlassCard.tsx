import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@react-navigation/native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassCard({ children, style }: GlassCardProps) {
  const { dark } = useTheme();

  const glassContent = (
    <View style={[
      styles.card, 
      { 
        borderColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        backgroundColor: dark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.6)'
      },
      style
    ]}>
      {children}
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webGlass, style]}>
        {glassContent}
      </View>
    );
  }

  return (
    <BlurView 
      intensity={dark ? 30 : 50} 
      tint={dark ? 'dark' : 'light'}
      style={[styles.blurContainer, style]}
    >
      {glassContent}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  webGlass: {
    borderRadius: 16,
    overflow: 'hidden',
    // @ts-ignore
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
});
