import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemedText } from '../components/common/ThemedText';
import { ThemedView } from '../components/common/ThemedView';
import { addStudent, bulkAddStudents } from '../services/api';

export default function AddStudentScreen() {
  const [name, setName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [file, setFile] = useState<File | null | undefined>(null);
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

  const bulkMutation = useMutation({
    mutationFn: bulkAddStudents,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      alert(
        `Successfully created ${data.created.length} students. ${data.duplicates.length} duplicates found.`
      );
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

  const handleBulkUpload = () => {
    if (!file) {
      alert('Error: Please select a file');
      return;
    }
    bulkMutation.mutate(file);
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

      <div className="my-6">
        <ThemedText type="title" className="text-2xl font-bold mb-4">
          Or Upload a CSV
        </ThemedText>
        <div className="mb-4">
          <ThemedText className="mb-2">CSV File</ThemedText>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="w-full border border-gray-300 p-2 rounded-lg dark:text-white dark:bg-gray-800"
          />
          </div>
        <button
            className="w-full bg-green-500 py-3 px-5 rounded-lg text-white font-bold text-center disabled:opacity-50"
            onClick={handleBulkUpload}
            disabled={!file || bulkMutation.isPending}
        >
            {bulkMutation.isPending ? 'Uploading...' : 'Upload CSV'}
        </button>
        </div>

    </ThemedView>
  );
}