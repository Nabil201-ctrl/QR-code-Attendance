import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';
import { getAttendance } from '../services/api';

export default function AdminScreen() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance'],
    queryFn: getAttendance,
  });

  const onRefresh = async () => {
    await refetch();
  };

  if (error) {
    alert('Error: Failed to load attendance data. Make sure the server is running.');
  }

  // Show loading state
  if (isLoading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText>Loading attendance data...</ThemedText>
      </ThemedView>
    );
  }

  const students = data?.students || [];
  const allDates = data?.allDates || [] as { date: string; purpose?: string | null }[];

  // Safe handling of latestDate (date string)
  const latestDate = allDates.length > 0 ? allDates[allDates.length - 1].date : undefined;
  
  const presentCount = latestDate
    ? students.filter(student => {
        const detail = student.attendanceDetails.find(d => d.date === latestDate);
        return detail?.status === 1;
      }).length
    : 0;
    
  const absentCount = latestDate
    ? students.filter(student => {
        const detail = student.attendanceDetails.find(d => d.date === latestDate);
        return detail?.status === 0;
      }).length
    : 0;

  const totalStudents = students.length;

  // Compute purpose categories and counts (how many sessions per purpose)
  const purposeCounts = allDates.reduce((acc: Record<string, number>, d) => {
    const key = d.purpose || 'General';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <ThemedView className="flex-1">
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <ThemedText type="title" className="text-2xl font-bold mb-1">
                Admin Dashboard
              </ThemedText>
              <ThemedText className="text-gray-500">
                Manage attendance and QR codes
              </ThemedText>
            </div>
            <button 
              onClick={onRefresh} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh data"
            >
              <span className="text-blue-500 text-xl">🔄</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 mb-6">
          <div className="flex gap-3">
            <Link 
              to="/admin/generate-qr" 
              className="flex-1 bg-purple-500 p-4 rounded-xl flex items-center justify-center shadow-lg hover:bg-purple-600 transition-colors"
            >
              <span className="text-white text-xl mr-2">📱</span>
              <ThemedText className="text-white font-semibold">
                Generate QR
              </ThemedText>
            </Link>
            
            <Link 
              to="/admin/students" 
              className="flex-1 bg-blue-500 p-4 rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
            >
              <span className="text-white text-xl mr-2">👥</span>
              <ThemedText className="text-white font-semibold">
                Students
              </ThemedText>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 mb-6">
          <ThemedText type="subtitle" className="text-lg font-semibold mb-3">
            Today's Overview
          </ThemedText>
          <div className="flex justify-between gap-3">
            <div className="flex-1 bg-green-100 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center mb-1">
                <span className="text-green-600">✅</span>
                <ThemedText className="text-green-800 dark:text-green-200 font-bold text-lg ml-1">
                  {presentCount}
                </ThemedText>
              </div>
              <ThemedText className="text-green-600 dark:text-green-400 text-sm">
                Present
              </ThemedText>
            </div>
            
            <div className="flex-1 bg-red-100 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center mb-1">
                <span className="text-red-600">❌</span>
                <ThemedText className="text-red-800 dark:text-red-200 font-bold text-lg ml-1">
                  {absentCount}
                </ThemedText>
              </div>
              <ThemedText className="text-red-600 dark:text-red-400 text-sm">
                Absent
              </ThemedText>
            </div>
            
            <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-1">
                <span className="text-blue-600">👥</span>
                <ThemedText className="text-blue-800 dark:text-blue-200 font-bold text-lg ml-1">
                  {totalStudents}
                </ThemedText>
              </div>
              <ThemedText className="text-blue-600 dark:text-blue-400 text-sm">
                Total
              </ThemedText>
            </div>
          </div>
          
          {latestDate && (
            <ThemedText className="text-gray-500 text-xs mt-2 text-center">
              As of {latestDate}
            </ThemedText>
          )}
          {/* Purpose categories summary */}
          {Object.keys(purposeCounts).length > 0 && (
            <div className="mt-4 flex gap-2 justify-center flex-wrap">
              {Object.entries(purposeCounts).map(([purpose, count]) => (
                <div key={purpose} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-sm">
                  <ThemedText className="font-medium">{purpose} • {count}</ThemedText>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance List */}
        <div className="mx-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <ThemedText type="subtitle" className="text-lg font-semibold">
              Attendance Records
            </ThemedText>
            <ThemedText className="text-gray-500">
              {totalStudents} students
            </ThemedText>
          </div>

          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <span className="text-gray-400 text-4xl mb-2">📊</span>
              <ThemedText className="text-gray-500">No attendance records found</ThemedText>
              <ThemedText className="text-gray-400 text-sm mt-2">
                Generate a QR code and have students scan it to start recording attendance
              </ThemedText>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 min-w-max">
                {/* Table Header */}
                <div className="flex bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <ThemedText className="w-40 px-4 py-3 font-semibold text-sm">Student</ThemedText>
                  {allDates.slice(0, 7).map(d => (
                    <div key={d.date} className="w-28 px-2 py-3 text-center">
                      <ThemedText className="font-semibold text-sm block">
                        {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </ThemedText>
                      <ThemedText className="text-xs text-gray-500 mt-1">
                        {d.purpose || 'General'}
                      </ThemedText>
                    </div>
                  ))}
                </div>

                {/* Table Rows */}
                {students.map(student => (
                  <div key={student._id} className="flex border-b border-gray-100 dark:border-gray-700 items-center min-h-12 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="w-40 px-4 py-3">
                      <ThemedText className="font-semibold">{student.name}</ThemedText>
                      <ThemedText className="text-gray-500 text-xs">
                        {student.matricNumber}
                      </ThemedText>
                    </div>
                    {allDates.slice(0, 7).map(d => {
                      const detail = student.attendanceDetails.find(dt => dt.date === d.date);
                      const isPresent = detail?.status === 1;
                      return (
                        <div key={d.date} className="w-28 flex items-center justify-center px-2">
                          <span className={`text-lg ${isPresent ? 'text-green-500' : 'text-red-500'}`}>
                            {isPresent ? '✅' : '❌'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              {/* Table Info */}
              {allDates.length > 7 && (
                <ThemedText className="text-gray-500 text-xs mt-2 text-center">
                  Showing last 7 days of {allDates.length} total dates
                </ThemedText>
              )}
            </div>
          )}
        </div>
      </div>
    </ThemedView>
  );
}