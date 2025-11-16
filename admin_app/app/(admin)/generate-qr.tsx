// app/(admin)/generate-qr.tsx
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import tw from 'twrnc';
import { ThemedText } from '../../components/common/ThemedText';
import { ThemedView } from '../../components/common/ThemedView';
import { generateQrCode } from '../../services/api';

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
    onError: (error: any) => {
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

  const copyToClipboard = () => {
    // You can implement clipboard functionality here
    Alert.alert('Copied!', 'QR Code data copied to clipboard.');
  };

  const getExpirationTimeOptions = () => [
    { label: '15 minutes', value: '900' },
    { label: '30 minutes', value: '1800' },
    { label: '1 hour', value: '3600' },
    { label: '2 hours', value: '7200' },
    { label: '4 hours', value: '14400' },
  ];

  return (
    <ThemedView style={tw`flex-1`}>
      <ScrollView style={tw`flex-1 p-6`} contentContainerStyle={tw`pb-8`}>
        <ThemedText type="title" style={tw`text-2xl font-bold mb-2`}>
          Generate QR Code
        </ThemedText>
        <ThemedText style={tw`text-gray-500 mb-6`}>
          Create a QR code for students to scan and mark attendance
        </ThemedText>

        {/* Expiration Time Selection */}
        <View style={tw`mb-6`}>
          <ThemedText style={tw`text-base font-semibold mb-3`}>
            Expiration Time
          </ThemedText>
          
          {/* Quick Selection Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-4`}>
            <View style={tw`flex-row gap-2`}>
              {getExpirationTimeOptions().map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={tw`px-4 py-2 rounded-lg border ${
                    expiresIn === option.value 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onPress={() => setExpiresIn(option.value)}
                >
                  <ThemedText style={tw`${
                    expiresIn === option.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  } font-medium`}>
                    {option.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Custom Input */}
          <View>
            <ThemedText style={tw`text-sm text-gray-600 dark:text-gray-400 mb-2`}>
              Custom time (in seconds)
            </ThemedText>
            <TextInput
              style={tw`border border-gray-300 dark:border-gray-700 p-4 rounded-xl text-base text-black dark:text-white bg-white dark:bg-gray-800`}
              keyboardType="numeric"
              value={expiresIn}
              onChangeText={setExpiresIn}
              placeholder="Enter seconds (e.g., 3600 for 1 hour)"
              placeholderTextColor={tw.color('text-gray-400')}
            />
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={tw`bg-blue-500 p-4 rounded-xl flex-row items-center justify-center shadow-lg mb-6 ${
            generateQrMutation.isPending ? 'opacity-50' : ''
          }`}
          onPress={handleGenerateQr}
          disabled={generateQrMutation.isPending}
        >
          <Ionicons 
            name="qr-code" 
            size={24} 
            color="white" 
            style={tw`mr-2`} 
          />
          <ThemedText style={tw`text-white text-lg font-semibold`}>
            {generateQrMutation.isPending ? 'Generating...' : 'Generate QR Code'}
          </ThemedText>
        </TouchableOpacity>

        {/* Error Display */}
        {error && (
          <View style={tw`bg-red-100 dark:bg-red-900/30 p-4 rounded-xl mb-6`}>
            <ThemedText style={tw`text-red-700 dark:text-red-300 font-bold`}>
              Error Generating QR Code
            </ThemedText>
            <ThemedText style={tw`text-red-600 dark:text-red-400 mt-1`}>
              {error}
            </ThemedText>
          </View>
        )}

        {/* QR Code Display */}
        {qrCodeData && (
          <View style={tw`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700`}>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <ThemedText type="subtitle" style={tw`text-lg font-semibold`}>
                Generated QR Code
              </ThemedText>
              <TouchableOpacity onPress={copyToClipboard}>
                <Ionicons name="copy-outline" size={20} color={tw.color('blue-500')} />
              </TouchableOpacity>
            </View>

            {/* QR Code Image */}
            <View style={tw`items-center mb-4`}>
              <QRCode
                value={qrCodeData}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>

            {/* Expiration Info */}
            {expiresAt && (
              <View style={tw`flex-row items-center bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg`}>
                <Ionicons name="time-outline" size={16} color={tw.color('orange-500')} />
                <ThemedText style={tw`text-orange-600 dark:text-orange-400 text-sm ml-2`}>
                  Expires: {new Date(expiresAt).toLocaleString()}
                </ThemedText>
              </View>
            )}

            {/* Regenerate Button */}
            <TouchableOpacity
              style={tw`bg-green-500 p-3 rounded-xl flex-row items-center justify-center mt-4 ${
                generateQrMutation.isPending ? 'opacity-50' : ''
              }`}
              onPress={handleGenerateQr}
              disabled={generateQrMutation.isPending}
            >
              <Ionicons name="refresh" size={20} color="white" style={tw`mr-2`} />
              <ThemedText style={tw`text-white font-semibold`}>
                Regenerate QR Code
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        {!qrCodeData && !error && (
          <View style={tw`mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl`}>
            <ThemedText style={tw`text-blue-800 dark:text-blue-200 font-semibold mb-2`}>
              💡 How it works:
            </ThemedText>
            <ThemedText style={tw`text-blue-700 dark:text-blue-300 text-sm`}>
              1. Set expiration time for the QR code{'\n'}
              2. Generate the QR code{'\n'}
              3. Students scan it with the app{'\n'}
              4. QR code automatically expires after set time
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}