import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { useQuery } from '@tanstack/react-query';
import { getAttendance } from '../../services/api';
import { useState } from 'react';
import tw from 'twrnc';
import { Link } from 'expo-router'; // Import Link for navigation

export default function AdminScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({ // Renamed attendance to data
    queryKey: ['attendance'],
    queryFn: getAttendance,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Extract students and allDates from the fetched data
  const students = data?.students || [];
  const allDates = data?.allDates || [];

  // Calculate stats based on the latest date
  const latestDate = allDates[0]; // Assuming allDates is sorted descending
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
          <ThemedText type="title" style={tw`text-2xl font-bold mb-2`}>
            Admin Dashboard
          </ThemedText>
          <ThemedText style={tw`text-gray-500`}>
            Manage attendance and QR codes
          </ThemedText>
        </View>

        {/* QR Code Generation Button */}
        <View style={tw`px-6 mb-6`}>
          <Link href="/(admin)/generate-qr" asChild>
            <TouchableOpacity
              style={tw`bg-purple-600 px-6 py-4 rounded-2xl flex-row items-center justify-center shadow-lg`}
            >
              <ThemedText style={tw`text-white text-lg font-semibold mr-2`}>
                Generate QR Code
              </ThemedText>
              {/* You can add an icon here if desired */}
            </TouchableOpacity>
          </Link>
        </View>

        {/* Stats Cards */}
        <View style={tw`px-6 mb-6`}>
          <View style={tw`flex-row justify-between gap-3`}>
            <View style={tw`flex-1 bg-green-100 dark:bg-green-900/30 p-4 rounded-xl`}>
              <ThemedText style={tw`text-green-800 dark:text-green-200 font-semibold text-lg`}>
                {presentCount}
              </ThemedText>
              <ThemedText style={tw`text-green-600 dark:text-green-400 text-sm`}>
                Present ({latestDate || 'N/A'})
              </ThemedText>
            </View>
            <View style={tw`flex-1 bg-red-100 dark:bg-red-900/30 p-4 rounded-xl`}>
              <ThemedText style={tw`text-red-800 dark:text-red-200 font-semibold text-lg`}>
                {absentCount}
              </ThemedText>
              <ThemedText style={tw`text-red-600 dark:text-red-400 text-sm`}>
                Absent ({latestDate || 'N/A'})
              </ThemedText>
            </View>
            <View style={tw`flex-1 bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl`}>
              <ThemedText style={tw`text-blue-800 dark:text-blue-200 font-semibold text-lg`}>
                {totalStudents}
              </ThemedText>
              <ThemedText style={tw`text-blue-600 dark:text-blue-400 text-sm`}>
                Total
              </ThemedText>
            </View>
          </View>
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
          ) : (
            <ScrollView horizontal>
              <View style={tw`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden`}>
                {/* Table Header */}
                <View style={tw`flex-row bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600`}>
                  <ThemedText style={tw`w-40 px-4 py-3 font-semibold text-sm`}>Student</ThemedText>
                  {allDates.map(date => (
                    <ThemedText key={date} style={tw`w-24 px-4 py-3 font-semibold text-sm text-center`}>{date}</ThemedText>
                  ))}
                </View>

                {/* Table Rows */}
                {students.map(student => (
                  <View key={student._id} style={tw`flex-row border-b border-gray-100 dark:border-gray-700 items-center`}>
                    <View style={tw`w-40 px-4 py-3`}>
                      <ThemedText style={tw`font-semibold`}>{student.name}</ThemedText>
                      <ThemedText style={tw`text-gray-500 text-xs`}>
                        {student.matricNumber}
                      </ThemedText>
                    </View>
                    {allDates.map(date => (
                      <View key={date} style={tw`w-24 items-center justify-center`}>
                        <Text style={tw`text-lg font-bold ${student.dates[date] === 1 ? 'text-green-500' : 'text-red-500'}`}>
                          {student.dates[date] ?? 0}
                        </Text>
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