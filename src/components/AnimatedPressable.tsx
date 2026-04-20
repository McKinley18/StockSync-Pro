import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
// import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'; // Temporarily disabled

interface AnimatedPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleTo?: number; // Target scale value when pressed - no longer used
}

const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  scaleTo = 0.95, // Default scale down slightly - no longer used
  ...rest
}) => {
  // const scale = useSharedValue(1); // Temporarily disabled

  // const animatedStyle = useAnimatedStyle(() => { // Temporarily disabled
  //   return {
  //     transform: [{ scale: scale.value }],
  //   };
  // });

  // const onPressIn = () => { // Temporarily disabled
  //   scale.value = withSpring(scaleTo, { damping: 10, stiffness: 100 });
  // };

  // const onPressOut = () => { // Temporarily disabled
  //   scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  // };

  return (
    <TouchableOpacity
      activeOpacity={0.8} // Re-enable default opacity for standard TouchableOpacity
      // onPressIn={onPressIn} // Temporarily disabled
      // onPressOut={onPressOut} // Temporarily disabled
      {...rest}
    >
      <View> {/* Replace Animated.View with standard View */}
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default AnimatedPressable;
