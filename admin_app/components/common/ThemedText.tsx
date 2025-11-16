import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constant/Colors';

type TextType = 'default' | 'title' | 'subtitle' | 'link';

interface ThemedTextProps extends TextProps {
  type?: TextType;
  children?: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  type = 'default', 
  style, 
  children, 
  ...props 
}) => {
  const { colorScheme } = useColorScheme();

  const getTextStyle = () => {
    switch (type) {
      case 'title':
        return styles.title;
      case 'subtitle':
        return styles.subtitle;
      case 'link':
        return styles.link;
      default:
        return styles.default;
    }
  };

  return (
    <Text
      style={[
        getTextStyle(),
        {
          color: Colors[colorScheme].text,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3b82f6',
    fontWeight: '500',
  },
});