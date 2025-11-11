import { Text, TextProps } from 'react-native';
import { ThemedText } from './common/ThemedText';

export function StyledText(props: TextProps) {
  return <ThemedText {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}
