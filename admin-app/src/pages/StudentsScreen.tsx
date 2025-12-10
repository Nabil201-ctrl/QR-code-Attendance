import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';
import type { Student } from '../services/api';
import { bulkDeleteStudents, deleteStudent, getStudents } from '../services/api';

const AttendanceDetail: React.FC<{ details: { date: string; status: number }[] }> = ({ details }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="text-blue-500 hover:underline">
        {isOpen ? 'Hide Details' : 'Show Details'}
      </button>
      {isOpen && (
        <div className="mt-2 p-2 border rounded">
          {details.map(detail => (
            <div key={detail.date} className="flex justify-between">
              <ThemedText>{detail.date}</ThemedText>
              <ThemedText>{detail.status === 1 ? 'Present' : 'Absent'}</ThemedText>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default function StudentsScreen() {
  const queryClient = useQueryClient();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { data: students, isLoading, refetch } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      alert('Success: Student deleted successfully');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to delete student';
      alert(`Error: ${message}`);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteStudents,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setSelectedStudents([]);
      alert(`Success: ${data.message}`);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to delete students';
      alert(`Error: ${message}`);
    },
  });

  const handleDelete = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(studentId);
    }
  };

  const handleBulkDelete = () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to delete');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedStudents.length} student(s)?`)) {
      bulkDeleteMutation.mutate(selectedStudents);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === students?.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students?.map(s => s._id) || []);
    }
  };

  const onRefresh = async () => {
    await refetch();
  };

  return (
    <ThemedView className="flex-1">
      <div className="flex-1 overflow-auto">
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <ThemedText type="title" className="text-2xl font-bold mb-2">
                Students
              </ThemedText>
              <ThemedText className="text-gray-500">
                Manage students
              </ThemedText>
            </div>
            <button
              onClick={onRefresh}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="px-6 mb-6">
          <div className="flex gap-3">
            <Link to="/admin/add-student" className="flex-1 bg-blue-500 py-3 px-5 rounded-lg text-center hover:bg-blue-600 transition-colors">
              <ThemedText className="text-white font-bold">
                Add Student
              </ThemedText>
            </Link>
            {selectedStudents.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 py-3 px-5 rounded-lg text-center transition-colors disabled:opacity-50"
              >
                <ThemedText className="text-white font-bold">
                  {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete Selected (${selectedStudents.length})`}
                </ThemedText>
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <ThemedText>Loading students...</ThemedText>
          </div>
        ) : students?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl mx-6">
            <span className="text-gray-400 text-4xl mb-2">👥</span>
            <ThemedText className="text-gray-500">No students found</ThemedText>
          </div>
        ) : (
          <div className="mx-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="flex bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="w-12 px-4 py-3 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === students?.length && students.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
                <ThemedText className="flex-1 px-4 py-3 font-semibold text-sm">Name</ThemedText>
                <ThemedText className="flex-1 px-4 py-3 font-semibold text-sm">Matric Number</ThemedText>
                <ThemedText className="flex-1 px-4 py-3 font-semibold text-sm">Attendance</ThemedText>
                <ThemedText className="w-48 px-4 py-3 font-semibold text-sm text-center">Actions</ThemedText>
              </div>

              {students?.map(student => (
                <div key={student._id} className="flex border-b border-gray-100 dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="w-12 px-4 py-3 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => toggleStudentSelection(student._id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                  <div className="flex-1 px-4 py-3">
                    <ThemedText className="font-semibold">{student.name}</ThemedText>
                  </div>
                  <div className="flex-1 px-4 py-3">
                    <ThemedText className="text-gray-600 dark:text-gray-400">{student.matricNumber}</ThemedText>
                  </div>
                  <div className="flex-1 px-4 py-3">
                    <ThemedText>{student.attendancePercentage}%</ThemedText>
                    <AttendanceDetail details={student.attendanceDetails} />
                  </div>
                  <div className="w-48 px-4 py-3 flex justify-center space-x-2">
                    <Link 
                      to={`/admin/edit-student/${student._id}`} 
                      className="bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded-lg transition-colors"
                    >
                      <ThemedText className="text-white font-bold text-sm">Edit</ThemedText>
                    </Link>
                    <button
                      className="bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      onClick={() => handleDelete(student._id)}
                      disabled={deleteMutation.isPending}
                    >
                      <ThemedText className="text-white font-bold text-sm">
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </ThemedText>
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