import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  marginBottom?: number;
  marginTop?: number;
  marginHorizontal?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width,
  height,
  borderRadius = 4,
  marginBottom = 0,
  marginTop = 0,
  marginHorizontal = 0,
}) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          marginBottom,
          marginTop,
          marginHorizontal,
          backgroundColor: colors.border, // Use a themed color for subtlety
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    // Basic styles, opacity handled by animation
  },
});

export default SkeletonLoader;