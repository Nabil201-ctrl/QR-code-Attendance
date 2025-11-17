// app/(admin)/generate-qr.tsx
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import tw from 'twrnc';
import { ThemedText } from '../../components/common/ThemedText';
import { ThemedView } from '../../components/common/ThemedView';
import { generateQrCode } from '../../services/api';

type ExpirationOption = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function GenerateQrScreen() {
  const [expiresIn, setExpiresIn] = useState('3600');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQrMutation = useMutation({
    mutationFn: (data: { expiresIn: number }) => generateQrCode(data.expiresIn),
    onSuccess: (data) => {
      setError(null);
      setQrCodeData(data.data);
      setExpiresAt(data.expiresAt);
      Alert.alert('Success', 'QR Code generated successfully!');
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to generate QR Code. Make sure the server is running.');
    },
  });

  const handleGenerateQr = () => {
    setQrCodeData(null);
    setError(null);
    const expiresInNum = parseInt(expiresIn, 10);
    if (isNaN(expiresInNum) || expiresInNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid positive number for expiration time.');
      return;
    }
    generateQrMutation.mutate({ expiresIn: expiresInNum });
  };

  const copyToClipboard = async () => {
    if (qrCodeData) {
      await Clipboard.setStringAsync(qrCodeData);
      Alert.alert('Copied!', 'QR Code data copied to clipboard.');
    } else {
      Alert.alert('Error', 'No QR Code data to copy.');
    }
  };

  const getExpirationTimeOptions = (): ExpirationOption[] => [
    { label: '15 min', value: '900', icon: 'timer-outline' },
    { label: '30 min', value: '1800', icon: 'time-outline' },
    { label: '1 hour', value: '3600', icon: 'hourglass-outline' },
    { label: '2 hours', value: '7200', icon: 'calendar-outline' },
    { label: '4 hours', value: '14400', icon: 'calendar-outline' },
  ];

  const options = getExpirationTimeOptions();

  return (
    <ThemedView style={tw`flex-1 bg-gray-50 dark:bg-gray-900`}>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-8`}>
        {/* Header Section */}
        <View style={tw`bg-blue-600 px-6 pt-8 pb-12 rounded-b-3xl`}>
          <View style={tw`flex-row items-center mb-3`}>
            <View style={tw`bg-white/20 p-3 rounded-2xl mr-3`}>
              <Ionicons name="qr-code-outline" size={32} color="white" />
            </View>
            <View style={tw`flex-1`}>
              <ThemedText style={tw`text-3xl font-bold text-white mb-1`}>
                QR Generator
              </ThemedText>
              <ThemedText style={tw`text-blue-100 text-base`}>
                Create attendance codes for your students
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={tw`px-6 -mt-6`}>
          {/* Expiration Time Card */}
          <View style={tw`bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6`}>
            <View style={tw`flex-row items-center mb-4`}>
              <Ionicons name="time" size={22} color={tw.color('blue-500')} />
              <ThemedText style={tw`text-lg font-bold ml-2 dark:text-white`}>
                Set Expiration Time
              </ThemedText>
            </View>
            
            {/* Quick Selection Grid */}
            <View style={tw`flex-row flex-wrap gap-3 mb-5`}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    tw`flex-1 min-w-[45%] px-4 py-4 rounded-xl border-2`,
                    expiresIn === option.value 
                      ? tw`bg-blue-500 border-blue-500` 
                      : tw`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600`
                  ]}
                  onPress={() => setExpiresIn(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={tw`items-center`}>
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={expiresIn === option.value ? 'white' : tw.color('gray-600 dark:gray-300')} 
                      style={tw`mb-2`}
                    />
                    <ThemedText style={[
                      tw`font-semibold text-base text-center`,
                      expiresIn === option.value ? tw`text-white` : tw`text-gray-700 dark:text-gray-200`
                    ]}>
                      {option.label}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Input with Enhanced Styling */}
            <View style={tw`mt-2`}>
              <View style={tw`flex-row items-center mb-2`}>
                <Ionicons name="create-outline" size={16} color={tw.color('gray-500')} />
                <ThemedText style={tw`text-sm font-medium text-gray-600 dark:text-gray-400 ml-2`}>
                  Custom Duration (seconds)
                </ThemedText>
              </View>
              <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4`}>
                <Ionicons name="keypad-outline" size={20} color={tw.color('gray-400')} />
                <TextInput
                  style={tw`flex-1 p-4 text-base font-medium text-gray-800 dark:text-white ml-2`}
                  keyboardType="numeric"
                  value={expiresIn}
                  onChangeText={setExpiresIn}
                  placeholder="e.g., 3600"
                  placeholderTextColor={tw.color('gray-400')}
                />
              </View>
            </View>
          </View>

          {/* Generate Button with Enhanced Design */}
          <TouchableOpacity
            style={[
              tw`bg-blue-500 p-5 rounded-2xl flex-row items-center justify-center mb-6`,
              generateQrMutation.isPending && tw`opacity-60`
            ]}
            onPress={handleGenerateQr}
            disabled={generateQrMutation.isPending}
            activeOpacity={0.8}
          >
            <View style={tw`bg-white/20 p-2 rounded-full mr-3`}>
              <Ionicons 
                name={generateQrMutation.isPending ? "hourglass" : "qr-code"} 
                size={24} 
                color="white" 
              />
            </View>
            <ThemedText style={tw`text-white text-lg font-bold`}>
              {generateQrMutation.isPending ? 'Generating...' : 'Generate QR Code'}
            </ThemedText>
          </TouchableOpacity>

          {/* Error Display with Better Design */}
          {error && (
            <View style={tw`bg-red-50 dark:bg-red-900/30 p-5 rounded-2xl mb-6 border-l-4 border-red-500`}>
              <View style={tw`flex-row items-center mb-2`}>
                <Ionicons name="alert-circle" size={24} color={tw.color('red-600 dark:red-400')} />
                <ThemedText style={tw`text-red-700 dark:text-red-300 font-bold text-lg ml-2`}>
                  Generation Failed
                </ThemedText>
              </View>
              <ThemedText style={tw`text-red-600 dark:text-red-400 text-base leading-5`}>
                {error}
              </ThemedText>
            </View>
          )}

          {/* QR Code Display with Premium Design */}
          {qrCodeData && (
            <View style={tw`bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700`}>
              <View style={tw`flex-row items-center justify-between mb-6`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`bg-green-100 dark:bg-green-900/30 p-2 rounded-xl mr-3`}>
                    <Ionicons name="checkmark-circle" size={24} color={tw.color('green-600 dark:green-400')} />
                  </View>
                  <ThemedText style={tw`text-xl font-bold dark:text-white`}>
                    Your QR Code
                  </ThemedText>
                </View>
                <TouchableOpacity 
                  onPress={copyToClipboard}
                  style={tw`bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl`}
                  activeOpacity={0.7}
                >
                  <Ionicons name="copy-outline" size={22} color={tw.color('blue-600 dark:blue-400')} />
                </TouchableOpacity>
              </View>

              {/* QR Code Image with Better Framing */}
              <View style={tw`items-center mb-6`}>
                <View style={tw`bg-white p-6 rounded-3xl border-4 border-gray-100`}>
                  <QRCode
                    value={qrCodeData}
                    size={220}
                    backgroundColor="white"
                    color="black"
                  />
                </View>
              </View>

              {/* Expiration Info with Enhanced Visual */}
              {expiresAt && (
                <View style={tw`bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl mb-4 border border-orange-200 dark:border-orange-800`}>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`bg-orange-100 dark:bg-orange-900/40 p-2 rounded-xl mr-3`}>
                      <Ionicons name="timer" size={20} color={tw.color('orange-600 dark:orange-400')} />
                    </View>
                    <View style={tw`flex-1`}>
                      <ThemedText style={tw`text-orange-900 dark:text-orange-300 font-semibold text-sm mb-1`}>
                        Expires On
                      </ThemedText>
                      <ThemedText style={tw`text-orange-700 dark:text-orange-400 text-base font-bold`}>
                        {new Date(expiresAt).toLocaleString()}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              )}

              {/* Regenerate Button */}
              <TouchableOpacity
                style={[
                  tw`bg-green-500 p-4 rounded-2xl flex-row items-center justify-center`,
                  generateQrMutation.isPending && tw`opacity-60`
                ]}
                onPress={handleGenerateQr}
                disabled={generateQrMutation.isPending}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-circle" size={24} color="white" style={tw`mr-2`} />
                <ThemedText style={tw`text-white font-bold text-base`}>
                  Generate New Code
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Instructions with Modern Card Design */}
          {!qrCodeData && !error && (
            <View style={tw`mt-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800`}>
              <View style={tw`flex-row items-center mb-4`}>
                <View style={tw`bg-blue-100 dark:bg-blue-900/40 p-2 rounded-xl mr-3`}>
                  <Ionicons name="bulb" size={24} color={tw.color('blue-600 dark:blue-400')} />
                </View>
                <ThemedText style={tw`text-blue-900 dark:text-blue-200 font-bold text-lg`}>
                  Quick Guide
                </ThemedText>
              </View>
              <View style={tw`ml-1`}>
                {[
                  'Select or enter expiration time',
                  'Tap "Generate QR Code" button',
                  'Show QR code to students to scan',
                  'Code expires automatically'
                ].map((step, index) => (
                  <View key={index} style={tw`flex-row items-start mb-3`}>
                    <View style={tw`bg-blue-500 rounded-full w-7 h-7 items-center justify-center mr-3 mt-0.5`}>
                      <ThemedText style={tw`text-white font-bold text-sm`}>
                        {index + 1}
                      </ThemedText>
                    </View>
                    <ThemedText style={tw`text-blue-800 dark:text-blue-300 text-base flex-1 leading-6`}>
                      {step}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}