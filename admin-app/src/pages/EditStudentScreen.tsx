import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';
import { getStudents, updateStudent } from '../services/api';
import type { Student } from '../services/api'

export default function EditStudentScreen() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const student = students?.find(s => s._id === id);

  useEffect(() => {
    if (student) {
      setName(student.name);
      setMatricNumber(student.matricNumber);
    }
  }, [student]);

  const mutation = useMutation({
    mutationFn: (updatedStudent: { id: string; data: { name: string; matricNumber: string } }) =>
      updateStudent(updatedStudent.id, updatedStudent.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      navigate(-1);
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!name.trim() || !matricNumber.trim()) {
      alert('Error: Please fill in all fields');
      return;
    }
    if (id) {
      mutation.mutate({ id, data: { name, matricNumber } });
    }
  };

  if (isLoading) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <ThemedText>Loading student...</ThemedText>
      </ThemedView>
    );
  }

  if (!student) {
    return (
      <ThemedView className="flex-1 items-center justify-center p-6">
        <ThemedText>Student not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1 p-6">
      <ThemedText type="title" className="text-2xl font-bold mb-4">
        Edit Student
      </ThemedText>
      <div className="mb-4">
        <ThemedText className="mb-2">Name</ThemedText>
        <input
          className="w-full border border-gray-300 p-2 rounded-lg dark:text-white dark:bg-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter student's name"
        />
      </div>
      <div className="mb-4">
        <ThemedText className="mb-2">Matric Number</ThemedText>
        <input
          className="w-full border border-gray-300 p-2 rounded-lg dark:text-white dark:bg-gray-800"
          value={matricNumber}
          onChange={(e) => setMatricNumber(e.target.value)}
          placeholder="Enter student's matric number"
        />
      </div>
      <button
        className="w-full bg-blue-500 py-3 px-5 rounded-lg text-white font-bold text-center disabled:opacity-50"
        onClick={handleSubmit}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Updating...' : 'Update Student'}
      </button>
    </ThemedView>
  );
}