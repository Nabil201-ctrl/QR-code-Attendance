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
          Attendance System
        </ThemedText>
        <ThemedText style={tw`text-center text-gray-500 text-lg mb-8`}>
          Choose your role to continue
        </ThemedText>
      </View>

      <View style={tw`flex-row gap-4`}>
        <Link href="/(student)" asChild>
          <TouchableOpacity 
            style={tw`bg-blue-500 px-6 py-4 rounded-2xl flex-1 items-center shadow-lg`}
          >
            <Ionicons name="person" size={24} color="white" style={tw`mb-2`} />
            <Text style={tw`text-white text-lg font-semibold text-center`}>
              Student
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(admin)" asChild>
          <TouchableOpacity 
            style={tw`bg-green-500 px-6 py-4 rounded-2xl flex-1 items-center shadow-lg`}
          >
            <Ionicons name="shield" size={24} color="white" style={tw`mb-2`} />
            <Text style={tw`text-white text-lg font-semibold text-center`}>
              Admin
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={tw`mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl`}>
        <ThemedText style={tw`text-center text-sm`}>
          📱 Student: Scan QR Codes{'\n'}
          🛡️ Admin: Manage Attendance & Generate QR Codes
        </ThemedText>
      </View>
    </ThemedView>
  );
}