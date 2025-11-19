import { Link } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';

export default function Index() {
  return (
    <ThemedView className="flex-1 flex justify-center items-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <span className="text-6xl mb-6 block">🏫</span>
          <ThemedText type="title" className="text-center mb-4">
            Attendance System
          </ThemedText>
          <ThemedText className="text-center text-gray-500 text-lg mb-8">
            Choose your role to continue
          </ThemedText>
        </div>

        <div className="flex gap-4 mb-12">
          <Link to="/student" className="flex-1 bg-blue-500 px-6 py-4 rounded-2xl flex flex-col items-center shadow-lg">
            <span className="text-white text-2xl mb-2">👤</span>
            <span className="text-white text-lg font-semibold text-center">
              Student
            </span>
          </Link>

          <Link to="/admin" className="flex-1 bg-green-500 px-6 py-4 rounded-2xl flex flex-col items-center shadow-lg">
            <span className="text-white text-2xl mb-2">🛡️</span>
            <span className="text-white text-lg font-semibold text-center">
              Admin
            </span>
          </Link>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <ThemedText className="text-center text-sm whitespace-pre-line">
            📱 Student: Scan QR Codes{'\n'}
            🛡️ Admin: Manage Attendance & Generate QR Codes
          </ThemedText>
        </div>
      </div>
    </ThemedView>
  );
}