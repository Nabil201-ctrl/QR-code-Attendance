import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';
import { useColorScheme } from '../hooks/useColorScheme';

export default function StudentScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const scaleAnim = useRef(0.8);
  const fadeAnim = useRef(0);
  const pulseAnim = useRef(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // CSS animations will handle the effects
  }, []);

  return (
    <ThemedView className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-500 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-2xl mr-3">
              <span className="text-white text-2xl">🏫</span>
            </div>
            <div>
              <ThemedText type="title" className="text-2xl font-bold text-white">
                Student Portal
              </ThemedText>
              <ThemedText className="text-blue-100 text-sm mt-0.5">
                Quick Attendance
              </ThemedText>
            </div>
          </div>
          <div className="flex items-center bg-white/20 rounded-full px-3 py-2">
            <span className="text-white text-lg mr-2">
              {colorScheme === 'dark' ? '🌙' : '☀️'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={colorScheme === 'dark'}
                onChange={toggleColorScheme}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-blue-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center px-6 -mt-4">
        <div className={`items-center justify-center w-full transition-all duration-500 ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          {/* Animated QR Icon with Glow Effect */}
          <div className="mb-8 items-center justify-center animate-pulse">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-8 shadow-xl">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-6">
                <span className="text-white text-6xl">📱</span>
              </div>
            </div>
          </div>

          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl w-full mb-6 border border-gray-100 dark:border-gray-700">
            <ThemedText type="title" className="text-3xl font-bold text-center mb-3">
              Mark Attendance
            </ThemedText>
            <ThemedText type="default" className="text-center text-base leading-6 text-gray-600 dark:text-gray-400">
              Scan the QR code displayed by your instructor to mark your presence in class
            </ThemedText>
          </div>

          {/* Enhanced Scan Button */}
          <Link to="/student/scan" className="block">
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 px-10 py-5 rounded-2xl flex items-center justify-center shadow-2xl w-full max-w-xs hover:from-blue-600 hover:to-blue-700 transition-all">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <span className="text-white text-2xl">📷</span>
              </div>
              <span className="text-white text-xl font-bold flex-1 text-center">
                Scan QR Code
              </span>
            </button>
          </Link>

          {/* Feature Cards */}
          <div className="flex gap-3 mt-8 w-full">
            <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-200 dark:border-green-800">
              <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-xl self-start mb-2">
                <span className="text-green-600 dark:text-green-400 text-lg">⚡</span>
              </div>
              <ThemedText className="font-semibold text-sm text-green-900 dark:text-green-300">
                Quick & Easy
              </ThemedText>
              <ThemedText className="text-xs text-green-700 dark:text-green-400 mt-1">
                Mark in seconds
              </ThemedText>
            </div>

            <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-xl self-start mb-2">
                <span className="text-purple-600 dark:text-purple-400 text-lg">🛡️</span>
              </div>
              <ThemedText className="font-semibold text-sm text-purple-900 dark:text-purple-300">
                Secure
              </ThemedText>
              <ThemedText className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                Verified codes
              </ThemedText>
            </div>
          </div>

          {/* Enhanced Instructions */}
          <div className="mt-8 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl w-full border border-amber-200 dark:border-amber-800">
            <div className="flex items-center mb-3">
              <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-xl mr-2">
                <span className="text-amber-600 dark:text-amber-400 text-lg">ℹ️</span>
              </div>
              <ThemedText className="font-bold text-amber-900 dark:text-amber-300">
                Before You Scan
              </ThemedText>
            </div>
            
            <div className="ml-1">
              <div className="flex items-start mb-2">
                <span className="text-amber-600 dark:text-amber-400 text-lg mr-2 mt-0.5">📶</span>
                <ThemedText className="text-sm text-amber-800 dark:text-amber-300 flex-1">
                  Ensure stable internet connection
                </ThemedText>
              </div>
              <div className="flex items-start">
                <span className="text-amber-600 dark:text-amber-400 text-lg mr-2 mt-0.5">📸</span>
                <ThemedText className="text-sm text-amber-800 dark:text-amber-300 flex-1">
                  Allow camera access when prompted
                </ThemedText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemedView>
  );
}