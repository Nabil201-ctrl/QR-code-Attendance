import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { ThemedText } from '../../components/common/ThemedText';
import { ThemedView } from '../../components/common/ThemedView';
import { getStudents, Student } from '../../services/api';

export default function StudentsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: students, isLoading, refetch } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ThemedView style={tw`flex-1`}>
      <ScrollView
        style={tw`flex-1`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={tw`p-6 pb-4`}>
          <ThemedText type="title" style={tw`text-2xl font-bold mb-2`}>
            Students
          </ThemedText>
          <ThemedText style={tw`text-gray-500`}>
            Manage students
          </ThemedText>
        </View>

        <View style={tw`px-6 mb-6`}>
          <Link href="/(admin)/add-student" asChild>
            <TouchableOpacity style={tw`bg-blue-500 py-3 px-5 rounded-lg`}>
              <ThemedText style={tw`text-white font-bold text-center`}>
                Add Student
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </View>

        {isLoading ? (
          <View style={tw`items-center py-8`}>
            <ThemedText>Loading students...</ThemedText>
          </View>
        ) : (
          <View style={tw`mx-6 mb-6`}>
            <View style={tw`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden`}>
              <View style={tw`flex-row bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600`}>
                <ThemedText style={tw`w-40 px-4 py-3 font-semibold text-sm`}>Name</ThemedText>
                <ThemedText style={tw`w-40 px-4 py-3 font-semibold text-sm`}>Matric Number</ThemedText>
                <ThemedText style={tw`w-40 px-4 py-3 font-semibold text-sm text-center`}>Actions</ThemedText>
              </View>

              {students?.map(student => (
                <View key={student._id} style={tw`flex-row border-b border-gray-100 dark:border-gray-700 items-center`}>
                  <View style={tw`w-40 px-4 py-3`}>
                    <ThemedText style={tw`font-semibold`}>{student.name}</ThemedText>
                  </View>
                  <View style={tw`w-40 px-4 py-3`}>
                    <ThemedText>{student.matricNumber}</ThemedText>
                  </View>
                  <View style={tw`w-40 px-4 py-3 flex-row justify-center`}>
                    <Link href={`/(admin)/edit-student?id=${student._id}`} asChild>
                      <TouchableOpacity style={tw`bg-yellow-500 py-2 px-4 rounded-lg mr-2`}>
                        <ThemedText style={tw`text-white font-bold`}>Edit</ThemedText>
                      </TouchableOpacity>
                    </Link>
                    <TouchableOpacity style={tw`bg-red-500 py-2 px-4 rounded-lg`}>
                      <ThemedText style={tw`text-white font-bold`}>Delete</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}