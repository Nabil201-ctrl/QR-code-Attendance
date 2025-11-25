import { useMutation } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react'; // Changed from default import to named import
import { useState } from 'react';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';
import { generateQrCode } from '../services/api';

type ExpirationOption = {
  label: string;
  value: string;
  icon: string;
};

export default function GenerateQrScreen() {
  const [expiresIn, setExpiresIn] = useState('3600');
  const [purpose, setPurpose] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQrMutation = useMutation({
    mutationFn: (data: { expiresIn: number; purpose: string }) => generateQrCode(data.expiresIn, data.purpose),
    onSuccess: (data) => {
      setError(null);
      setQrCodeData(data.data);
      setExpiresAt(data.expiresAt);
      if (data.purpose) setPurpose(data.purpose);
      alert('Success: QR Code generated successfully!');
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
      alert('Invalid Input: Please enter a valid positive number for expiration time.');
      return;
    }
    if (!purpose || purpose.trim().length < 3) {
      alert('Please enter a purpose for the attendance (e.g., Reading, Meeting, Prep).');
      return;
    }

    generateQrMutation.mutate({ expiresIn: expiresInNum, purpose: purpose.trim() });
  };

  const copyToClipboard = async () => {
    if (qrCodeData) {
      await navigator.clipboard.writeText(qrCodeData);
      alert('Copied: QR Code data copied to clipboard.');
    } else {
      alert('Error: No QR Code data to copy.');
    }
  };

  const getExpirationTimeOptions = (): ExpirationOption[] => [
    { label: '15 min', value: '900', icon: '⏱️' },
    { label: '30 min', value: '1800', icon: '⏰' },
    { label: '1 hour', value: '3600', icon: '⌛' },
    { label: '2 hours', value: '7200', icon: '📅' },
    { label: '4 hours', value: '14400', icon: '📅' },
  ];

  const options = getExpirationTimeOptions();

  return (
    <ThemedView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-auto pb-8">
        {/* Header Section */}
        <div className="bg-blue-600 px-6 pt-8 pb-12 rounded-b-3xl">
          <div className="flex items-center mb-3">
            <div className="bg-white/20 p-3 rounded-2xl mr-3">
              <span className="text-2xl">📱</span>
            </div>
            <div className="flex-1">
              <ThemedText className="text-3xl font-bold text-white mb-1">
                QR Generator
              </ThemedText>
              <ThemedText className="text-blue-100 text-base">
                Create attendance codes for your students
              </ThemedText>
            </div>
          </div>
        </div>

        <div className="px-6 -mt-6">
          {/* Expiration Time Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-blue-500 text-xl">⏰</span>
              <ThemedText className="text-lg font-bold ml-2 dark:text-white">
                Set Expiration Time
              </ThemedText>
            </div>
            
            {/* Quick Selection Grid */}
            <div className="flex flex-wrap gap-3 mb-5">
              {options.map((option) => (
                <button
                  key={option.value}
                  className={`flex-1 min-w-[45%] px-4 py-4 rounded-xl border-2 ${
                    expiresIn === option.value 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                  onClick={() => setExpiresIn(option.value)}
                >
                  <div className="items-center text-center">
                    <span className="text-2xl mb-2 block">{option.icon}</span>
                    <ThemedText className={`font-semibold text-base ${
                      expiresIn === option.value ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                    }`}>
                      {option.label}
                    </ThemedText>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="mt-2">
              <div className="flex items-center mb-2">
                <span className="text-gray-500">✏️</span>
                <ThemedText className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-2">
                  Custom Duration (seconds)
                </ThemedText>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4">
                <span className="text-gray-400">🔢</span>
                <input
                  className="flex-1 p-4 text-base font-medium text-gray-800 dark:text-white ml-2 bg-transparent outline-none"
                  type="number"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  placeholder="e.g., 3600"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className={`w-full bg-blue-500 p-5 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${
              generateQrMutation.isPending ? 'opacity-60' : ''
            }`}
            onClick={handleGenerateQr}
            disabled={generateQrMutation.isPending}
          >
            <div className="bg-white/20 p-2 rounded-full mr-3">
              <span className="text-white text-xl">
                {generateQrMutation.isPending ? "⏳" : "📱"}
              </span>
            </div>
            <ThemedText className="text-white text-lg font-bold">
              {generateQrMutation.isPending ? 'Generating...' : 'Generate QR Code'}
            </ThemedText>
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 p-5 rounded-2xl mb-6 border-l-4 border-red-500">
              <div className="flex items-center mb-2">
                <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                <ThemedText className="text-red-700 dark:text-red-300 font-bold text-lg ml-2">
                  Generation Failed
                </ThemedText>
              </div>
              <ThemedText className="text-red-600 dark:text-red-400 text-base">
                {error}
              </ThemedText>
            </div>
          )}

          {/* QR Code Display */}
          {qrCodeData && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl mr-3">
                    <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
                  </div>
                  <ThemedText className="text-xl font-bold dark:text-white">
                    Your QR Code
                  </ThemedText>
                </div>
                <button 
                  className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl"
                  onClick={copyToClipboard}
                >
                  <span className="text-blue-600 dark:text-blue-400 text-xl">📋</span>
                </button>
              </div>

              {/* QR Code Image */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-6 rounded-3xl border-4 border-gray-100">
                  <QRCodeSVG
                    value={qrCodeData}
                    size={220}
                    bgColor="white"
                    fgColor="black"
                  />
                </div>
              </div>

              {/* Expiration Info */}
              {expiresAt && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl mb-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center">
                    <div className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-xl mr-3">
                      <span className="text-orange-600 dark:text-orange-400 text-xl">⏰</span>
                    </div>
                    <div className="flex-1">
                      <ThemedText className="text-orange-900 dark:text-orange-300 font-semibold text-sm mb-1">
                        Expires On
                      </ThemedText>
                      <ThemedText className="text-orange-700 dark:text-orange-400 text-base font-bold">
                        {new Date(expiresAt).toLocaleString()}
                      </ThemedText>
                    </div>
                  </div>
                </div>
              )}

              {/* Regenerate Button */}
              <button
                className={`w-full bg-green-500 p-4 rounded-2xl flex items-center justify-center ${
                  generateQrMutation.isPending ? 'opacity-60' : ''
                }`}
                onClick={handleGenerateQr}
                disabled={generateQrMutation.isPending}
              >
                <span className="text-white text-xl mr-2">🔄</span>
                <ThemedText className="text-white font-bold text-base">
                  Generate New Code
                </ThemedText>
              </button>
            </div>
          )}

          {/* Purpose Input */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-gray-500 text-xl">🎯</span>
              <ThemedText className="text-lg font-bold ml-2 dark:text-white">Purpose</ThemedText>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Describe the reason for this attendance code (e.g., Reading, Programming, Meeting, Prep).</p>
            <input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Reading – Programming Practice"
              className="w-full border-2 border-gray-200 dark:border-gray-700 p-4 rounded-xl text-lg bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Instructions */}
          {!qrCodeData && !error && (
            <div className="mt-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-xl mr-3">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">💡</span>
                </div>
                <ThemedText className="text-blue-900 dark:text-blue-200 font-bold text-lg">
                  Quick Guide
                </ThemedText>
              </div>
              <div className="ml-1">
                {[
                  'Select or enter expiration time',
                  'Click "Generate QR Code" button',
                  'Show QR code to students to scan',
                  'Code expires automatically'
                ].map((step, index) => (
                  <div key={index} className="flex items-start mb-3">
                    <div className="bg-blue-500 rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5">
                      <ThemedText className="text-white font-bold text-sm">
                        {index + 1}
                      </ThemedText>
                    </div>
                    <ThemedText className="text-blue-800 dark:text-blue-300 text-base flex-1">
                      {step}
                    </ThemedText>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemedView>
  );
}