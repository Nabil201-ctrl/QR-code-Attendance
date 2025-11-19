import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';
import { deleteStudent, getStudents} from '../services/api';
import type { Student } from '../services/api';

export default function StudentsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: students, isLoading, refetch } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleDelete = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(studentId);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ThemedView className="flex-1">
      <div className="flex-1 overflow-auto">
        <div className="p-6 pb-4">
          <ThemedText type="title" className="text-2xl font-bold mb-2">
            Students
          </ThemedText>
          <ThemedText className="text-gray-500">
            Manage students
          </ThemedText>
        </div>

        <div className="px-6 mb-6">
          <Link to="/admin/add-student" className="block bg-blue-500 py-3 px-5 rounded-lg text-center">
            <ThemedText className="text-white font-bold">
              Add Student
            </ThemedText>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <ThemedText>Loading students...</ThemedText>
          </div>
        ) : (
          <div className="mx-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="flex bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <ThemedText className="w-40 px-4 py-3 font-semibold text-sm">Name</ThemedText>
                <ThemedText className="w-40 px-4 py-3 font-semibold text-sm">Matric Number</ThemedText>
                <ThemedText className="w-40 px-4 py-3 font-semibold text-sm text-center">Actions</ThemedText>
              </div>

              {students?.map(student => (
                <div key={student._id} className="flex border-b border-gray-100 dark:border-gray-700 items-center">
                  <div className="w-40 px-4 py-3">
                    <ThemedText className="font-semibold">{student.name}</ThemedText>
                  </div>
                  <div className="w-40 px-4 py-3">
                    <ThemedText>{student.matricNumber}</ThemedText>
                  </div>
                  <div className="w-40 px-4 py-3 flex justify-center">
                    <Link to={`/admin/edit-student/${student._id}`} className="bg-yellow-500 py-2 px-4 rounded-lg mr-2">
                      <ThemedText className="text-white font-bold">Edit</ThemedText>
                    </Link>
                    <button
                      className="bg-red-500 py-2 px-4 rounded-lg"
                      onClick={() => handleDelete(student._id)}
                    >
                      <ThemedText className="text-white font-bold">Delete</ThemedText>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ThemedView>
  );
}