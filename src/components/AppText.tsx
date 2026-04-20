import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface AppTextProps extends TextProps {
  children?: React.ReactNode;
  weight?: 'regular' | 'medium' | 'bold';
}

const AppText: React.FC<AppTextProps> = ({ style, children, weight = 'regular', ...rest }) => {
  const fontFamily = {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  };

  return (
    <Text style={[styles.defaultText, { fontFamily: fontFamily[weight] }, style]} {...rest}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
  },
});

export default AppText;