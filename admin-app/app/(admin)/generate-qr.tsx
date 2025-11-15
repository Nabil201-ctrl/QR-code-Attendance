import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { useState } from 'react';
import tw from 'twrnc';
import { useMutation } from '@tanstack/react-query';
import { generateQrCode } from '../../services/api'; // Will create this function

export default function GenerateQrScreen() {
  const [expiresIn, setExpiresIn] = useState('3600'); // Default to 1 hour
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const generateQrMutation = useMutation({
    mutationFn: (data: { expiresIn: number }) => generateQrCode(data.expiresIn),
    onSuccess: (data) => {
      setQrCodeData(data.data);
      Alert.alert('Success', 'QR Code generated successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to generate QR Code.');
    },
  });

  const handleGenerateQr = () => {
    const expiresInNum = parseInt(expiresIn, 10);
    if (isNaN(expiresInNum) || expiresInNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid positive number for expiration time.');
      return;
    }
    generateQrMutation.mutate({ expiresIn: expiresInNum });
  };

  return (
    <ThemedView style={tw`flex-1 p-6`}>
      <ThemedText type="title" style={tw`text-2xl font-bold mb-6`}>
        Generate QR Code
      </ThemedText>

      <View style={tw`mb-4`}>
        <ThemedText style={tw`text-base mb-2`}>Expiration Time (seconds)</ThemedText>
        <TextInput
          style={tw`border border-gray-300 dark:border-gray-700 p-3 rounded-lg text-base text-black dark:text-white`}
          keyboardType="numeric"
          value={expiresIn}
          onChangeText={setExpiresIn}
          placeholder="e.g., 3600 for 1 hour"
          placeholderTextColor={tw.color('text-gray-400')}
        />
      </View>

      <TouchableOpacity
        style={tw`bg-blue-500 px-6 py-4 rounded-2xl flex-row items-center justify-center shadow-lg mb-4 ${generateQrMutation.isPending ? 'opacity-50' : ''}`}
        onPress={handleGenerateQr}
        disabled={generateQrMutation.isPending}
      >
        <ThemedText style={tw`text-white text-lg font-semibold`}>
          {generateQrMutation.isPending ? 'Generating...' : 'Generate QR Code'}
        </ThemedText>
      </TouchableOpacity>

      {qrCodeData && (
        <View style={tw`mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg`}>
          <ThemedText style={tw`text-base font-semibold mb-2`}>Generated QR Code Data:</ThemedText>
          <ThemedText style={tw`text-sm text-gray-700 dark:text-gray-300`}>{qrCodeData}</ThemedText>
          {/* Here you would typically render an actual QR code image */}
        </View>
      )}

      {qrCodeData && (
        <TouchableOpacity
          style={tw`bg-green-500 px-6 py-4 rounded-2xl flex-row items-center justify-center shadow-lg mt-4 ${generateQrMutation.isPending ? 'opacity-50' : ''}`}
          onPress={handleGenerateQr} // Regenerate
          disabled={generateQrMutation.isPending}
        >
          <ThemedText style={tw`text-white text-lg font-semibold`}>
            Regenerate QR Code
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}
