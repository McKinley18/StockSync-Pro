import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from './AppText';
// import AnimatedPressable from './AnimatedPressable'; // Removed
import { useTheme } from '@react-navigation/native';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionLabel, onAction }) => {
  const { colors, dark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: dark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}>
        {icon}
      </View>
      <AppText weight="bold" style={[styles.title, { color: colors.text }]}>{title}</AppText>
      <AppText style={[styles.description, { color: dark ? '#94a3b8' : '#64748b' }]}>{description}</AppText>
      
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <AppText weight="bold" style={styles.buttonText}>{actionLabel}</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
  },
});

export default EmptyState;
