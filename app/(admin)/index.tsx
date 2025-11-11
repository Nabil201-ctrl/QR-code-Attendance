import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { ThemedView } from '../components/common/ThemedView';
import { ThemedText } from '../components/common/ThemedText';
import QRCode from 'react-native-qrcode-svg';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../utils/queryClient';
import { useState, useEffect } from 'react';

async function fetchAttendance() {
  const res = await fetch('/api/attendance');
  return res.json();
}

async function generateQrCode() {
  const res = await fetch('/api/attendance', { method: 'PUT' });
  return res.json();
}

export default function AdminScreen() {
  const [timer, setTimer] = useState(0);

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: fetchAttendance,
    refetchInterval: 1000,
  });

  const { data: qrCodeData } = useQuery({
    queryKey: ['qrcode'],
    queryFn: generateQrCode,
  });

  const mutation = useMutation({
    mutationFn: generateQrCode,
    onSuccess: (data) => {
      queryClient.setQueryData(['qrcode'], data);
      queryClient.invalidateQueries({ queryKey: ['qrcode'] });
    },
  });

  useEffect(() => {
    if (qrCodeData) {
      setTimer(qrCodeData.expiresIn);
    }
  }, [qrCodeData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrCodeData]);

  const handleRegenerate = () => {
    mutation.mutate();
  };

  return (
    <ThemedView className="flex-1 p-4">
      <ThemedText type="title" className="text-center mb-4">Admin Dashboard</ThemedText>
      <View className="items-center mb-4">
        {timer > 0 && qrCodeData?.qrCode ? (
          <QRCode value={qrCodeData.qrCode} size={200} />
        ) : (
          <View className="w-200 h-200 bg-gray-200 justify-center items-center">
            <ThemedText>QR Code Expired</ThemedText>
          </View>
        )}
        <ThemedText className="mt-2">Expires in: {timer}s</ThemedText>
        <TouchableOpacity
          onPress={handleRegenerate}
          className="bg-blue-500 p-4 rounded-lg mt-2"
          disabled={mutation.isPending}
        >
          <Text className="text-white text-lg">{mutation.isPending ? 'Generating...' : 'Regenerate QR Code'}</Text>
        </TouchableOpacity>
      </View>
      <ThemedText type="subtitle" className="mb-2">Attendance List</ThemedText>
      {isLoading ? (
        <ThemedText>Loading...</ThemedText>
      ) : (
        <FlatList
          data={attendance}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="flex-row justify-between p-2 border-b border-gray-300">
              <ThemedText>{item.time}</ThemedText>
              <ThemedText>{item.name}</ThemedText>
              <ThemedText>{item.level}</ThemedText>
              <ThemedText>{item.matricNumber}</ThemedText>
            </View>
          )}
        />
      )}
    </ThemedView>
  );
}
