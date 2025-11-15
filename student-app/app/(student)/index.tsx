import { View, Text, TouchableOpacity, Switch, Animated } from 'react-native';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Link } from 'expo-router';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constant/Colors';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function StudentScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ThemedView style={tw`flex-1`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center p-6 pt-12`}>
        <ThemedText type="title" style={tw`text-2xl font-bold`}>
          Student Portal
        </ThemedText>
        <View style={tw`flex-row items-center`}>
          <Ionicons 
            name={colorScheme === 'dark' ? 'moon' : 'sunny'} 
            size={20} 
            color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint} 
          />
          <Switch
            value={colorScheme === 'dark'}
            onValueChange={toggleColorScheme}
            thumbColor={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
            style={tw`mx-2`}
          />
        </View>
      </View>

      {/* Main Content */}
      <View style={tw`flex-1 justify-center items-center px-8`}>
        <Animated.View 
          style={[
            tw`items-center justify-center`,
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim }
          ]}
        >
          {/* Animated Icon */}
          <View style={tw`mb-8`}>
            <Ionicons 
              name="qr-code" 
              size={120} 
              color={colorScheme === 'dark' ? '#60a5fa' : '#3b82f6'} 
            />
          </View>

          {/* Welcome Text */}
          <ThemedText type="title" style={tw`text-3xl font-bold text-center mb-4`}>
            Mark Your Attendance
          </ThemedText>
          <ThemedText type="default" style={tw`text-center text-lg mb-12 text-gray-500`}>
            Scan the QR code provided by your instructor to mark your attendance for the class
          </ThemedText>

          {/* Scan Button */}
          <Link href="/(student)/scan" asChild>
            <TouchableOpacity 
              style={tw`bg-blue-500 px-8 py-4 rounded-2xl flex-row items-center shadow-lg shadow-blue-500/30`}
            >
              <Ionicons name="camera" size={24} color="white" style={tw`mr-3`} />
              <Text style={tw`text-white text-lg font-semibold`}>Scan QR Code</Text>
            </TouchableOpacity>
          </Link>

          {/* Instructions */}
          <View style={tw`mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl`}>
            <ThemedText type="default" style={tw`text-center text-sm`}>
              💡 Make sure you have a stable internet connection{'\n'}
              📱 Allow camera permissions when prompted
            </ThemedText>
          </View>
        </Animated.View>
      </View>
    </ThemedView>
  );
}