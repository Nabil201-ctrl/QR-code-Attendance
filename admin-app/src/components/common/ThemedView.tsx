import React from 'react';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface ThemedViewProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  className = '',
  children, 
  ...props 
}) => {
  const { colorScheme } = useColorScheme();
  
  return (
    <div
      className={`min-h-screen ${className}`}
      style={{
        backgroundColor: Colors[colorScheme].background,
      }}
      {...props}
    >
      {children}
    </div>
  );
};