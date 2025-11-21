import { useMutation } from '@tanstack/react-query';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';
import { submitAttendance } from '../services/attendanceService';
import {
  generateDeviceFingerprint,
  markAsScannedToday
} from '../utils/deviceUtils';
import { queryClient } from '../utils/queryClient';

export default function ScanScreen() {
  const [scanned, setScanned] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [name, setName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [scanEnabled, setScanEnabled] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: submitAttendance,
    onSuccess: async () => {
      await markAsScannedToday(qrCodeData);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });

      alert('Success! Your attendance has been recorded successfully.');
      navigate(-1);
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
      setScanEnabled(true);
    }
  });

  // Request permission and get device fingerprint
  useEffect(() => {
    const initialize = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setCameraPermission(true);
      } catch (error) {
        setCameraPermission(false);
      }

      generateDeviceFingerprint().then(setDeviceFingerprint);
    };

    initialize();
  }, []);

  // Start QR Scanner (mobile-safe)
  useEffect(() => {
    if (!cameraPermission || scanned) return;

    const html5QrCode = new Html5Qrcode('qr-reader');

    async function startScanner() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) return;

        // Pick the first supported camera (usually back camera)
        const cameraId = devices[0].id;

        await html5QrCode.start(
          { deviceId: { exact: cameraId } },
          {
            fps: 10,
            qrbox: 250,
            aspectRatio: 1.0
          },
          decodedText => {
            if (!scanEnabled) return;

            setScanEnabled(false);
            setScanned(true);
            setQrCodeData(decodedText);

            html5QrCode.stop().catch(() => {});
          },
          error => console.log('Scan error', error)
        );

        scannerRef.current = html5QrCode;
      } catch (error) {
        console.error('Scanner start failed:', error);
      }
    }

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [cameraPermission, scanned, scanEnabled]);

  const handleSubmit = () =>
    mutation.mutate({
      name: name.trim(),
      matricNumber: matricNumber.trim(),
      deviceFingerprint,
      qrCodeData
    });

  const resetScanner = () => {
    setScanned(false);
    setQrCodeData('');
    setName('');
    setMatricNumber('');
    setScanEnabled(true);
  };

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
    } catch {
      alert('Camera access is required to scan QR codes.');
    }
  };

  // UI Logic starts here
  if (cameraPermission === null) {
    return (
      <ThemedView className="min-h-screen flex items-center justify-center p-8">
        <ThemedText className="text-lg text-center mb-4">
          Requesting camera permission...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!cameraPermission) {
    return (
      <ThemedView className="min-h-screen flex items-center justify-center p-8">
        <span className="text-gray-500 text-6xl mb-6">📵</span>
        <ThemedText type="title" className="text-center mb-2">
          Camera Access Required
        </ThemedText>
        <ThemedText className="text-center text-gray-500 mb-8">
          We need camera access to scan QR codes for attendance
        </ThemedText>
        <button
          onClick={requestPermission}
          className="bg-blue-500 px-6 py-3 rounded-xl flex items-center hover:bg-blue-600 transition-colors"
        >
          <span className="text-white text-lg mr-2">📷</span>
          <span className="text-white font-semibold">Grant Permission</span>
        </button>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="min-h-screen">
      {!scanned ? (
        <div className="flex flex-col h-screen">
          <div className="flex-1 relative bg-black">
            <div id="qr-reader" className="w-full h-full min-h-[350px]" />

            {/* Overlay */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-white rounded-2xl border-dashed opacity-80 relative">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-20 left-0 right-0 flex justify-center items-center pointer-events-none">
              <div className="text-center bg-black/50 px-4 py-2 rounded-lg">
                <ThemedText className="text-white text-lg font-semibold mb-2">
                  Scan QR Code
                </ThemedText>
                <ThemedText className="text-white opacity-80">
                  Point your camera at the QR code
                </ThemedText>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen p-6">
          <div className="text-center mb-8">
            <span className="text-green-500 text-6xl mb-4 block">✅</span>
            <ThemedText type="title" className="text-2xl font-bold text-center mb-2">
              QR Code Scanned!
            </ThemedText>
            <ThemedText className="text-center text-gray-500">
              Please enter your details to complete attendance
            </ThemedText>
          </div>

          <div className="space-y-6">
            <div>
              <ThemedText className="text-lg font-semibold mb-3">
                Full Name
              </ThemedText>
              <input
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-700 p-4 rounded-xl text-lg bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <ThemedText className="text-lg font-semibold mb-3">
                Matric Number
              </ThemedText>
              <input
                placeholder="Enter your matric number"
                value={matricNumber}
                onChange={e => setMatricNumber(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-700 p-4 rounded-xl text-lg bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetScanner}
                className="flex-1 bg-gray-500 p-4 rounded-xl text-white text-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Scan Again
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-500 p-4 rounded-xl text-white text-lg font-semibold hover:bg-green-600 transition-colors"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <ThemedText className="text-center text-sm text-yellow-800 dark:text-yellow-200">
                🔒 Your device fingerprint is recorded to prevent duplicate submissions
              </ThemedText>
            </div>

            {import.meta.env.DEV && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ThemedText className="text-xs font-mono break-all">
                  Device Fingerprint: {deviceFingerprint}
                </ThemedText>
                <ThemedText className="text-xs font-mono break-all mt-2">
                  QR Data: {qrCodeData}
                </ThemedText>
              </div>
            )}
          </div>
        </div>
      )}
    </ThemedView>
  );
}
