import { Text, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ThemedView } from '../components/common/ThemedView';
import { ThemedText } from '../components/common/ThemedText';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  return (
    <ThemedView style={tw`flex-1 justify-center items-center p-8`}>
      <View style={tw`items-center mb-12`}>
        <Ionicons name="school" size={80} color="#3b82f6" style={tw`mb-6`} />
        <ThemedText type="title" style={tw`text-center mb-4`}>
          Student Attendance System
        </ThemedText>
        <ThemedText style={tw`text-center text-gray-500 text-lg`}>
          Mark your attendance quickly and securely
        </ThemedText>
      </View>

      <Link href="/(student)" asChild>
        <TouchableOpacity 
          style={tw`bg-blue-500 px-8 py-4 rounded-2xl flex-row items-center shadow-lg`}
        >
          <Ionicons name="log-in" size={24} color="white" style={tw`mr-3`} />
          <Text style={tw`text-white text-lg font-semibold`}>
            Enter Student Portal
          </Text>
        </TouchableOpacity>
      </Link>

      <View style={tw`mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl`}>
        <ThemedText style={tw`text-center text-sm`}>
          📱 Scan QR codes • 🔒 Secure • ⚡ Fast
        </ThemedText>
      </View>
    </ThemedView>
  );
}