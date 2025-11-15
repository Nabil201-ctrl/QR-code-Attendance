// app/(admin)/index.tsx
import { View, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { useQuery } from '@tanstack/react-query';
import { getAttendance } from '../../services/api';
import { useState } from 'react';
import tw from 'twrnc';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance'],
    queryFn: getAttendance,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Show error if any
  if (error) {
    Alert.alert('Error', 'Failed to load attendance data. Make sure the server is running.');
  }

  const students = data?.students || [];
  const allDates = data?.allDates || [];

  const latestDate = allDates[0];
  const presentCount = students.filter(student => student.dates[latestDate] === 1).length;
  const absentCount = students.filter(student => student.dates[latestDate] === 0).length;
  const totalStudents = students.length;

  return (
    <ThemedView style={tw`flex-1`}>
      <ScrollView
        style={tw`flex-1`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={tw`p-6 pb-4`}>
          <View style={tw`flex-row items-center justify-between`}>
            <View>
              <ThemedText type="title" style={tw`text-2xl font-bold mb-1`}>
                Admin Dashboard
              </ThemedText>
              <ThemedText style={tw`text-gray-500`}>
                Manage attendance and QR codes
              </ThemedText>
            </View>
            <TouchableOpacity onPress={onRefresh} style={tw`p-2`}>
              <Ionicons name="refresh" size={24} color={tw.color('blue-500')} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={tw`px-6 mb-6`}>
          <View style={tw`flex-row gap-3`}>
            <Link href="/(admin)/generate-qr" asChild>
              <TouchableOpacity style={tw`flex-1 bg-purple-500 p-4 rounded-xl flex-row items-center justify-center shadow-lg`}>
                <Ionicons name="qr-code" size={20} color="white" style={tw`mr-2`} />
                <ThemedText style={tw`text-white font-semibold`}>
                  Generate QR
                </ThemedText>
              </TouchableOpacity>
            </Link>
            
            <Link href="/(admin)/students" asChild>
              <TouchableOpacity style={tw`flex-1 bg-blue-500 p-4 rounded-xl flex-row items-center justify-center shadow-lg`}>
                <Ionicons name="people" size={20} color="white" style={tw`mr-2`} />
                <ThemedText style={tw`text-white font-semibold`}>
                  Students
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={tw`px-6 mb-6`}>
          <ThemedText type="subtitle" style={tw`text-lg font-semibold mb-3`}>
            Today's Overview
          </ThemedText>
          <View style={tw`flex-row justify-between gap-3`}>
            <View style={tw`flex-1 bg-green-100 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-800`}>
              <View style={tw`flex-row items-center mb-1`}>
                <Ionicons name="checkmark-circle" size={16} color={tw.color('green-600')} />
                <ThemedText style={tw`text-green-800 dark:text-green-200 font-bold text-lg ml-1`}>
                  {presentCount}
                </ThemedText>
              </View>
              <ThemedText style={tw`text-green-600 dark:text-green-400 text-sm`}>
                Present
              </ThemedText>
            </View>
            
            <View style={tw`flex-1 bg-red-100 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-800`}>
              <View style={tw`flex-row items-center mb-1`}>
                <Ionicons name="close-circle" size={16} color={tw.color('red-600')} />
                <ThemedText style={tw`text-red-800 dark:text-red-200 font-bold text-lg ml-1`}>
                  {absentCount}
                </ThemedText>
              </View>
              <ThemedText style={tw`text-red-600 dark:text-red-400 text-sm`}>
                Absent
              </ThemedText>
            </View>
            
            <View style={tw`flex-1 bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800`}>
              <View style={tw`flex-row items-center mb-1`}>
                <Ionicons name="people" size={16} color={tw.color('blue-600')} />
                <ThemedText style={tw`text-blue-800 dark:text-blue-200 font-bold text-lg ml-1`}>
                  {totalStudents}
                </ThemedText>
              </View>
              <ThemedText style={tw`text-blue-600 dark:text-blue-400 text-sm`}>
                Total
              </ThemedText>
            </View>
          </View>
          
          {latestDate && (
            <ThemedText style={tw`text-gray-500 text-xs mt-2 text-center`}>
              As of {latestDate}
            </ThemedText>
          )}
        </View>

        {/* Attendance List */}
        <View style={tw`mx-6 mb-6`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <ThemedText type="subtitle" style={tw`text-lg font-semibold`}>
              Attendance Records
            </ThemedText>
            <ThemedText style={tw`text-gray-500`}>
              {totalStudents} students
            </ThemedText>
          </View>

          {isLoading ? (
            <View style={tw`items-center py-8`}>
              <ThemedText>Loading attendance records...</ThemedText>
            </View>
          ) : students.length === 0 ? (
            <View style={tw`items-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl`}>
              <Ionicons name="alert-circle" size={48} color={tw.color('gray-400')} />
              <ThemedText style={tw`text-gray-500 mt-2`}>No attendance records found</ThemedText>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={tw`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700`}>
                {/* Table Header */}
                <View style={tw`flex-row bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600`}>
                  <ThemedText style={tw`w-40 px-4 py-3 font-semibold text-sm`}>Student</ThemedText>
                  {allDates.slice(0, 7).map(date => ( // Show only last 7 days
                    <ThemedText key={date} style={tw`w-20 px-2 py-3 font-semibold text-sm text-center`}>
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </ThemedText>
                  ))}
                </View>

                {/* Table Rows */}
                {students.map(student => (
                  <View key={student._id} style={tw`flex-row border-b border-gray-100 dark:border-gray-700 items-center min-h-12`}>
                    <View style={tw`w-40 px-4 py-3`}>
                      <ThemedText style={tw`font-semibold`}>{student.name}</ThemedText>
                      <ThemedText style={tw`text-gray-500 text-xs`}>
                        {student.matricNumber}
                      </ThemedText>
                    </View>
                    {allDates.slice(0, 7).map(date => (
                      <View key={date} style={tw`w-20 items-center justify-center px-2`}>
                        <Ionicons 
                          name={student.dates[date] === 1 ? "checkmark" : "close"} 
                          size={16} 
                          color={student.dates[date] === 1 ? tw.color('green-500') : tw.color('red-500')} 
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}