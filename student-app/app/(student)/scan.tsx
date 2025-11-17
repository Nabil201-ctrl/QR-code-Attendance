import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import * as Application from 'expo-application';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { ThemedText } from '../../components/common/ThemedText';
import { ThemedView } from '../../components/common/ThemedView';
import { submitAttendance } from '../../services/attendanceService'; // Import the new service
import { queryClient } from '../../utils/queryClient';

// Generate a unique device fingerprint
async function generateDeviceFingerprint() {
  try {
    let deviceId = 'unknown';

    if (Platform.OS === 'android') {
      deviceId = (await Application.getAndroidId()) || 'unknown-android';
    } else if (Platform.OS === 'ios') {
      deviceId = (await Application.getIosIdForVendorAsync()) || 'unknown-ios';
    }

    const deviceType = Device.deviceType || Device.DeviceType.UNKNOWN;
    const brand = Device.brand || 'unknown';
    const model = Device.modelName || 'unknown';
    const osVersion = Device.osVersion || 'unknown';
    const deviceName = Device.deviceName || 'unknown';

    const fingerprintData = {
      deviceId,
      deviceType: deviceType.toString(),
      brand,
      model,
      osVersion,
      platform: Platform.OS,
      deviceName,
    };

    // Create a hash-like string from the device data
    return Object.values(fingerprintData)
      .map(value => value.toString().replace(/\s+/g, '-').toLowerCase())
      .join('-');
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    // Fallback to a random ID if device info fails
    return `fallback-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Check if device has already scanned today
async function hasScannedToday(qrCode: string): Promise<boolean> {
  try {
    const today = new Date().toDateString();
    const key = `attendance-${today}-${qrCode}`;
    const hasScanned = await AsyncStorage.getItem(key);
    return hasScanned !== null;
  } catch (error) {
    console.error('Error checking scan history:', error);
    return false;
  }
}

// Mark device as scanned for today
async function markAsScannedToday(qrCode: string) {
  try {
    const today = new Date().toDateString();
    const key = `attendance-${today}-${qrCode}`;
    await AsyncStorage.setItem(key, JSON.stringify({
      scannedAt: new Date().toISOString(),
      qrCode,
    }));
  } catch (error) {
    console.error('Error saving scan history:', error);
  }
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(''); // Renamed from qrCode to qrCodeData
  const [name, setName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const mutation = useMutation({
    mutationFn: submitAttendance, // Use the imported service function
    onSuccess: async () => {
      // Mark as scanned for today
      await markAsScannedToday(qrCodeData);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });

      Alert.alert(
        'Success!',
        'Your attendance has been recorded successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  useEffect(() => {
    if (scanned) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [scanned]);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }

    // Generate device fingerprint on mount
    generateDeviceFingerprint().then(setDeviceFingerprint);
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    // Check if device has already scanned this QR code today
    const alreadyScanned = await hasScannedToday(data);

    if (alreadyScanned) {
      Alert.alert(
        'Already Scanned',
        'You have already marked your attendance for this class today.',
        [{ text: 'OK' }]
      );
      return;
    }

    setScanned(true);
    setQrCodeData(data); // Use qrCodeData
  };

  const handleSubmit = async () => {
    if (!name.trim() || !matricNumber.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    mutation.mutate({
      name: name.trim(),
      matricNumber: matricNumber.trim(),
      fingerprint: deviceFingerprint,
      qrCodeData, // Use qrCodeData
    });
  };

  const resetScanner = () => {
    setScanned(false);
    setQrCodeData('');
    setName('');
    setMatricNumber('');
    fadeAnim.setValue(0);
  };

  if (!permission) {
    return (
      <ThemedView style={tw`flex-1 items-center justify-center p-8`}>
        <ThemedText style={tw`text-lg text-center mb-4`}>
          Requesting camera permission...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={tw`flex-1 items-center justify-center p-8`}>
        <Ionicons name="camera-off" size={64} color="#6b7280" style={tw`mb-6`} />
        <ThemedText type="title" style={tw`text-center mb-2`}>
          Camera Access Required
        </ThemedText>
        <ThemedText style={tw`text-center text-gray-500 mb-8`}>
          We need camera access to scan QR codes for attendance
        </ThemedText>
        <TouchableOpacity
          onPress={requestPermission}
          style={tw`bg-blue-500 px-6 py-3 rounded-xl flex-row items-center`}
        >
          <Ionicons name="camera" size={20} color="white" style={tw`mr-2`} />
          <Text style={tw`text-white font-semibold`}>Grant Permission</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={tw`flex-1`}>
      {!scanned ? (
        <View style={tw`flex-1`}>
          <CameraView
            onBarcodeScanned={handleBarCodeScanned} // Always active for debugging
            style={StyleSheet.absoluteFillObject}
            facing="back"
          />
          {/* Scanner Overlay */}
          <View style={tw`flex-1 justify-center items-center`}>
            <View style={tw`w-64 h-64 border-4 border-white rounded-2xl border-dashed opacity-80`}>
              <View style={tw`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg`} />
              <View style={tw`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg`} />
              <View style={tw`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg`} />
              <View style={tw`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg`} />
            </View>
          </View>

          {/* Instructions */}
          <View style={tw`absolute bottom-20 left-0 right-0 items-center`}>
            <ThemedText style={tw`text-white text-center text-lg font-semibold mb-2`}>
              Scan QR Code
            </ThemedText>
            <ThemedText style={tw`text-white text-center opacity-80`}>
              Point your camera at the QR code
            </ThemedText>
          </View>
        </View>
      ) : (
        <Animated.View
          style={[
            tw`flex-1 p-6`,
            { opacity: fadeAnim }
          ]}
        >
          {/* Header */}
          <View style={tw`items-center mb-8`}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" style={tw`mb-4`} />
            <ThemedText type="title" style={tw`text-2xl font-bold text-center mb-2`}>
              QR Code Scanned!
            </ThemedText>
            <ThemedText style={tw`text-center text-gray-500`}>
              Please enter your details to complete attendance
            </ThemedText>
          </View>

          {/* Form */}
          <View style={tw`flex-1`}>
            <View style={tw`mb-6`}>
              <ThemedText style={tw`text-lg font-semibold mb-3`}>Full Name</ThemedText>
              <TextInput
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                style={tw`border-2 border-gray-200 dark:border-gray-700 p-4 rounded-xl text-lg bg-white dark:bg-gray-800`}
                autoCapitalize="words"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={tw`mb-8`}>
              <ThemedText style={tw`text-lg font-semibold mb-3`}>Matric Number</ThemedText>
              <TextInput
                placeholder="Enter your matric number"
                value={matricNumber}
                onChangeText={setMatricNumber}
                style={tw`border-2 border-gray-200 dark:border-gray-700 p-4 rounded-xl text-lg bg-white dark:bg-gray-800`}
                autoCapitalize="characters"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Action Buttons */}
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                onPress={resetScanner}
                style={tw`flex-1 bg-gray-500 p-4 rounded-xl mr-3 items-center`}
                disabled={mutation.isPending}
              >
                <Text style={tw`text-white text-lg font-semibold`}>Scan Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                style={tw`flex-1 bg-green-500 p-4 rounded-xl ml-3 items-center`}
                disabled={mutation.isPending}
              >
                <Text style={tw`text-white text-lg font-semibold`}>
                  {mutation.isPending ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Security Notice */}
            <View style={tw`mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl`}>
              <ThemedText style={tw`text-center text-sm text-yellow-800 dark:text-yellow-200`}>
                🔒 Your device fingerprint is recorded to prevent duplicate submissions
              </ThemedText>
            </View>

            {/* Debug Info (remove in production) */}
            {__DEV__ && (
              <View style={tw`mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded`}>
                <ThemedText style={tw`text-xs`}>
                  Device Fingerprint: {deviceFingerprint}
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>
      )}
    </ThemedView>
  );
}