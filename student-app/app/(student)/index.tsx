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
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Pulsing animation for the QR icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <ThemedView style={tw`flex-1 bg-gray-50 dark:bg-gray-900`}>
      {/* Enhanced Header with Gradient Background */}
      <View style={tw`bg-gradient-to-b from-blue-600 to-blue-500 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg`}>
        <View style={tw`flex-row justify-between items-center`}>
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-white/20 p-3 rounded-2xl mr-3`}>
              <Ionicons name="school-outline" size={28} color="white" />
            </View>
            <View>
              <ThemedText type="title" style={tw`text-2xl font-bold text-white`}>
                Student Portal
              </ThemedText>
              <ThemedText style={tw`text-blue-100 text-sm mt-0.5`}>
                Quick Attendance
              </ThemedText>
            </View>
          </View>
          <View style={tw`flex-row items-center bg-white/20 rounded-full px-3 py-2`}>
            <Ionicons 
              name={colorScheme === 'dark' ? 'moon' : 'sunny'} 
              size={18} 
              color="white" 
            />
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={toggleColorScheme}
              thumbColor="white"
              trackColor={{ false: '#93c5fd', true: '#1e40af' }}
              style={tw`mx-1 transform scale-90`}
            />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={tw`flex-1 justify-center items-center px-6 -mt-4`}>
        <Animated.View 
          style={[
            tw`items-center justify-center w-full`,
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim }
          ]}
        >
          {/* Animated QR Icon with Glow Effect */}
          <Animated.View 
            style={[
              tw`mb-8 items-center justify-center`,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={tw`bg-blue-100 dark:bg-blue-900/30 rounded-full p-8 shadow-xl`}>
              <View style={tw`bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-6`}>
                <Ionicons 
                  name="qr-code-outline" 
                  size={80} 
                  color="white" 
                />
              </View>
            </View>
          </Animated.View>

          {/* Welcome Card */}
          <View style={tw`bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl w-full mb-6 border border-gray-100 dark:border-gray-700`}>
            <ThemedText type="title" style={tw`text-3xl font-bold text-center mb-3`}>
              Mark Attendance
            </ThemedText>
            <ThemedText type="default" style={tw`text-center text-base leading-6 text-gray-600 dark:text-gray-400`}>
              Scan the QR code displayed by your instructor to mark your presence in class
            </ThemedText>
          </View>

          {/* Enhanced Scan Button */}
          <Link href="/(student)/scan" asChild>
            <TouchableOpacity 
              style={tw`bg-gradient-to-r from-blue-500 to-blue-600 px-10 py-5 rounded-2xl flex-row items-center shadow-2xl w-full max-w-xs`}
              activeOpacity={0.8}
            >
              <View style={tw`bg-white/20 p-2 rounded-full mr-3`}>
                <Ionicons name="scan" size={28} color="white" />
              </View>
              <Text style={tw`text-white text-xl font-bold flex-1 text-center`}>
                Scan QR Code
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Feature Cards */}
          <View style={tw`flex-row gap-3 mt-8 w-full`}>
            <View style={tw`flex-1 bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-200 dark:border-green-800`}>
              <View style={tw`bg-green-100 dark:bg-green-900/40 p-2 rounded-xl self-start mb-2`}>
                <Ionicons name="flash" size={20} color={tw.color('green-600 dark:green-400')} />
              </View>
              <ThemedText style={tw`font-semibold text-sm text-green-900 dark:text-green-300`}>
                Quick & Easy
              </ThemedText>
              <ThemedText style={tw`text-xs text-green-700 dark:text-green-400 mt-1`}>
                Mark in seconds
              </ThemedText>
            </View>

            <View style={tw`flex-1 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800`}>
              <View style={tw`bg-purple-100 dark:bg-purple-900/40 p-2 rounded-xl self-start mb-2`}>
                <Ionicons name="shield-checkmark" size={20} color={tw.color('purple-600 dark:purple-400')} />
              </View>
              <ThemedText style={tw`font-semibold text-sm text-purple-900 dark:text-purple-300`}>
                Secure
              </ThemedText>
              <ThemedText style={tw`text-xs text-purple-700 dark:text-purple-400 mt-1`}>
                Verified codes
              </ThemedText>
            </View>
          </View>

          {/* Enhanced Instructions */}
          <View style={tw`mt-8 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl w-full border border-amber-200 dark:border-amber-800`}>
            <View style={tw`flex-row items-center mb-3`}>
              <View style={tw`bg-amber-100 dark:bg-amber-900/40 p-2 rounded-xl mr-2`}>
                <Ionicons name="information-circle" size={20} color={tw.color('amber-600 dark:amber-400')} />
              </View>
              <ThemedText style={tw`font-bold text-amber-900 dark:text-amber-300`}>
                Before You Scan
              </ThemedText>
            </View>
            
            <View style={tw`ml-1`}>
              <View style={tw`flex-row items-start mb-2`}>
                <Ionicons name="wifi" size={16} color={tw.color('amber-600 dark:amber-400')} style={tw`mr-2 mt-0.5`} />
                <ThemedText style={tw`text-sm text-amber-800 dark:text-amber-300 flex-1`}>
                  Ensure stable internet connection
                </ThemedText>
              </View>
              <View style={tw`flex-row items-start`}>
                <Ionicons name="camera" size={16} color={tw.color('amber-600 dark:amber-400')} style={tw`mr-2 mt-0.5`} />
                <ThemedText style={tw`text-sm text-amber-800 dark:text-amber-300 flex-1`}>
                  Allow camera access when prompted
                </ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </ThemedView>
  );
}