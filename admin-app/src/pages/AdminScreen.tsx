import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Link } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';
import { getAttendance, updateAttendance } from '../services/api';

// Define types for your data
interface AttendanceDetail {
  date: string;
  status: number;
}

interface Student {
  _id: string;
  name: string;
  matricNumber: string;
  attendanceDetails: AttendanceDetail[];
}

interface DateInfo {
  date: string;
  purpose?: string | null;
}

interface AttendanceData {
  students: Student[];
  allDates: DateInfo[];
}

// Type for CSV data
type CSVData = (string | number)[][];

export default function AdminScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery<AttendanceData>({
    queryKey: ['attendance'],
    queryFn: getAttendance,
  });
  
  const [csvData, setCsvData] = useState<CSVData>([]);
  const [editMode, setEditMode] = useState(false);

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, date, status }: { studentId: string; date: string; status: number }) => {
      console.log('🔄 Calling updateAttendance API with:', { studentId, date, status });
      const result = await updateAttendance(studentId, date, status);
      console.log('📦 API Response:', result);
      return result;
    },
    onMutate: async ({ studentId, date, status }) => {
      console.log('🎯 onMutate - Optimistic update:', { studentId, date, status });
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['attendance'] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<AttendanceData>(['attendance']);
      
      // Optimistically update the cache
      if (previousData) {
        const newData = {
          ...previousData,
          students: previousData.students.map(student => {
            if (student._id === studentId) {
              // Check if the date already exists in attendanceDetails
              const existingDetailIndex = student.attendanceDetails.findIndex(d => d.date === date);
              
              let newDetails;
              if (existingDetailIndex >= 0) {
                // Update existing detail
                newDetails = student.attendanceDetails.map(detail => {
                  if (detail.date === date) {
                    return { ...detail, status };
                  }
                  return detail;
                });
              } else {
                // Add new detail
                newDetails = [...student.attendanceDetails, { date, status }];
              }
              
              return {
                ...student,
                attendanceDetails: newDetails
              };
            }
            return student;
          })
        };
        queryClient.setQueryData(['attendance'], newData);
        console.log('✨ Optimistic update applied');
      }
      
      return { previousData };
    },
    onSuccess: (data) => {
      console.log('✅ Update successful:', data);
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: unknown, _variables, context) => {
      console.error('❌ Update failed:', error);
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['attendance'], context.previousData);
        console.log('🔙 Rolled back to previous data');
      }
      const message = error instanceof Error ? error.message : 'Failed to update attendance';
      alert(`Error: ${message}`);
    },
  });

  const handleAttendanceToggle = (studentId: string, date: string, currentStatus: number) => {
    console.log('🖱️ Click detected - Edit mode:', editMode, 'Student:', studentId, 'Date:', date, 'Current:', currentStatus);
    
    if (!editMode) {
      console.log('⚠️ Not in edit mode, ignoring click');
      return;
    }
    
    console.log('📝 Toggle attendance:', { studentId, date, currentStatus });
    const newStatus = currentStatus === 1 ? 0 : 1;
    console.log('➡️ New status will be:', newStatus);
    
    updateAttendanceMutation.mutate({ studentId, date, status: newStatus });
  };

  useEffect(() => {
    if (data) {
      const { students, allDates } = data;
      
      // Create headers
      const headers = [
        'Student Name', 
        'Matric Number', 
        ...allDates.map(d => 
          new Date(d.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })
        )
      ];
      
      // Create rows for each student
      const rows = students.map(student => {
        const row: (string | number)[] = [student.name, student.matricNumber];
        
        allDates.forEach(d => {
          const detail = student.attendanceDetails.find(dt => dt.date === d.date);
          row.push(detail?.status === 1 ? 1 : 0);
        });
        
        return row;
      });
      
      setCsvData([headers, ...rows]);
    }
  }, [data]);

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
  const allDates = data?.allDates || [];

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
              As of {new Date(latestDate).toLocaleDateString()}
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
            <div>
              <ThemedText type="subtitle" className="text-lg font-semibold">
                Attendance Records
              </ThemedText>
              <ThemedText className="text-gray-500 text-sm">
                {totalStudents} students
              </ThemedText>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('🔄 Toggling edit mode. Current:', editMode, 'New:', !editMode);
                  setEditMode(!editMode);
                }}
                className={`${editMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'} text-white font-bold py-2 px-4 rounded-lg transition-colors`}
              >
                {editMode ? '✓ Done Editing' : '✏️ Edit Mode'}
              </button>
              <CSVLink 
                data={csvData}
                filename={"attendance.csv"}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Export to CSV
              </CSVLink>
            </div>
          </div>
          
          {editMode && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                <ThemedText className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Edit Mode Active:</strong> Click on any attendance cell (✅ or ❌) to toggle between present and absent.
                </ThemedText>
                <button 
                  type="button"
                  className="ml-4 bg-green-500 text-white px-3 py-1 rounded text-sm"
                  onClick={() => {
                    console.log('🧪 TEST BUTTON CLICKED');
                    alert('Test button works! Edit mode is: ' + editMode);
                  }}
                >
                  Test Click
                </button>
              </div>
            </div>
          )}

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
                      const isUpdating = updateAttendanceMutation.isPending;
                      return (
                        <button 
                          type="button"
                          key={d.date} 
                          className={`w-28 flex items-center justify-center px-2 py-2 relative border-0 bg-transparent ${editMode ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 active:bg-blue-100 dark:active:bg-blue-900/50' : ''} ${isUpdating ? 'opacity-50' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAttendanceToggle(student._id, d.date, detail?.status || 0);
                          }}
                          disabled={!editMode || isUpdating}
                          title={editMode ? 'Click to toggle attendance' : 'Enable edit mode first'}
                        >
                          <span className={`text-lg pointer-events-none ${isPresent ? 'text-green-500' : 'text-red-500'} ${editMode ? 'hover:scale-125 transition-transform' : ''}`}>
                            {isPresent ? '✅' : '❌'}
                          </span>
                        </button>
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