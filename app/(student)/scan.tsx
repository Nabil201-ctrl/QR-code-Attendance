import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '../components/common/ThemedView';
import { ThemedText } from '../components/common/ThemedText';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import * as Device from 'expo-device';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../utils/queryClient';
import { router } from 'expo-router';
import tw from 'twrnc';

async function submitAttendance(data: {
  name: string;
  level: string;
  matricNumber: string;
  fingerprint: string;
  qrCode: string;
}) {
  const res = await fetch('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }

  return res.json();
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [matricNumber, setMatricNumber] = useState('');

  const mutation = useMutation({
    mutationFn: submitAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      router.back();
    },
    onError: (error: any) => {
      alert(error.message);
    },
  });

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setQrCode(data);
    alert(`Bar code with data ${data} has been scanned!`);
  };

  const handleSubmit = async () => {
    const fingerprint = await Device.getDeviceTypeAsync();
    mutation.mutate({
      name,
      level,
      matricNumber,
      fingerprint: fingerprint.toString(),
      qrCode,
    });
  };

  if (!permission) {
    return <ThemedText>Requesting for camera permission...</ThemedText>;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={tw`flex-1 items-center justify-center`}>
        <ThemedText>No access to camera</ThemedText>
        <TouchableOpacity onPress={requestPermission} style={tw`mt-4 bg-blue-500 p-3 rounded-lg`}>
          <Text style={tw`text-white`}>Grant Permission</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={tw`flex-1`}>
      {!scanned ? (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          facing="back"
        />
      ) : (
        <View style={tw`flex-1 justify-center p-4`}>
          <ThemedText type="title" style={tw`text-center mb-4`}>
            Enter your details
          </ThemedText>
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={tw`border border-gray-300 p-2 rounded-lg mb-4 text-lg`}
          />
          <TextInput
            placeholder="Level"
            value={level}
            onChangeText={setLevel}
            style={tw`border border-gray-300 p-2 rounded-lg mb-4 text-lg`}
          />
          <TextInput
            placeholder="Matric Number"
            value={matricNumber}
            onChangeText={setMatricNumber}
            style={tw`border border-gray-300 p-2 rounded-lg mb-4 text-lg`}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            style={tw`bg-blue-500 p-4 rounded-lg items-center`}
            disabled={mutation.isPending}
          >
            <Text style={tw`text-white text-lg`}>
              {mutation.isPending ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}
