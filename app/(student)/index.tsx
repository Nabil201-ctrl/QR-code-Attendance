import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { ThemedView } from '../components/common/ThemedView';
import { ThemedText } from '../components/common/ThemedText';
import { Link } from 'expo-router';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';

export default function StudentScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <ThemedView className="flex-1 justify-center items-center">
      <ThemedText type="title">Student Attendance</ThemedText>
      <View className="my-8" />
      <Link href="/(student)/scan" asChild>
        <TouchableOpacity className="bg-blue-500 p-4 rounded-lg">
          <Text className="text-white text-lg">Scan QR Code</Text>
        </TouchableOpacity>
      </Link>
      <View className="absolute top-12 right-4 flex-row items-center">
        <ThemedText>Light</ThemedText>
        <Switch
          value={colorScheme === 'dark'}
          onValueChange={toggleColorScheme}
          thumbColor={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
        />
        <ThemedText>Dark</ThemedText>
      </View>
    </ThemedView>
  );
}
