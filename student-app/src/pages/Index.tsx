import { Link } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';

export default function Index() {
  return (
    <ThemedView className="min-h-screen flex justify-center items-center p-8">
      <div className="text-center">
        <div className="mb-12">
          <span className="text-6xl mb-6 block">🏫</span>
          <ThemedText type="title" className="text-center mb-4">
            Student Attendance System
          </ThemedText>
          <ThemedText className="text-center text-gray-500 text-lg">
            Mark your attendance quickly and securely
          </ThemedText>
        </div>

        <Link to="/student">
          <button className="bg-blue-500 px-8 py-4 rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors">
            <span className="text-white text-2xl mr-3">🚪</span>
            <span className="text-white text-lg font-semibold">
              Enter Student Portal
            </span>
          </button>
        </Link>

        <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <ThemedText className="text-center text-sm">
            Scan QR codes • Secure • Fast
          </ThemedText>
        </div>
      </div>
    </ThemedView>
  );
}