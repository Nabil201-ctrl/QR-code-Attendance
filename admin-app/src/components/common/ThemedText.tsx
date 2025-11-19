import React from 'react';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

type TextType = 'default' | 'title' | 'subtitle' | 'link';

interface ThemedTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  type?: TextType;
  children?: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  type = 'default', 
  className = '',
  children, 
  ...props 
}) => {
  const { colorScheme } = useColorScheme();

  const getTextSize = () => {
    switch (type) {
      case 'title':
        return 'text-3xl font-bold';
      case 'subtitle':
        return 'text-xl font-semibold';
      case 'link':
        return 'text-blue-500 font-medium';
      default:
        return 'text-base';
    }
  };

  return (
    <p
      className={`${getTextSize()} ${className}`}
      style={{
        color: Colors[colorScheme].text,
      }}
      {...props}
    >
      {children}
    </p>
  );
};