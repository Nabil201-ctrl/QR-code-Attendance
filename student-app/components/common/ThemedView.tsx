import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constant/Colors';

interface ThemedViewProps extends ViewProps {
  children?: React.ReactNode;
}

export const ThemedView: React.FC<ThemedViewProps> = ({ style, children, ...props }) => {
  const { colorScheme } = useColorScheme();
  
  return (
    <View
      style={[
        {
          backgroundColor: Colors[colorScheme].background,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};