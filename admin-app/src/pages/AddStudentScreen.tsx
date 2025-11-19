import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';
import { addStudent } from '../services/api';

export default function AddStudentScreen() {
  const [name, setName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: addStudent,
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
    mutation.mutate({ name, matricNumber });
  };

  return (
    <ThemedView className="flex-1 p-6">
      <ThemedText type="title" className="text-2xl font-bold mb-4">
        Add New Student
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
        {mutation.isPending ? 'Adding...' : 'Add Student'}
      </button>
    </ThemedView>
  );
}