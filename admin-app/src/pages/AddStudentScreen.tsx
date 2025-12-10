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
      alert('Success: Student added successfully');
      navigate(-1);
    },
    onError: (error: any) => {
      console.error('Add student error:', error);
      const message = error?.message || 'Failed to add student';
      alert(`Error: ${message}`);
    },
  });

  const bulkMutation = useMutation({
    mutationFn: bulkAddStudents,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      alert(
        `Success: Created ${data.created.length} students. ${data.duplicates.length > 0 ? `${data.duplicates.length} duplicates skipped.` : ''}`
      );
      navigate(-1);
    },
    onError: (error: any) => {
      console.error('Bulk upload error:', error);
      const message = error?.message || 'Failed to upload students';
      alert(`Error: ${message}`);
    },
  });

  const handleSubmit = () => {
    if (!name.trim() || !matricNumber.trim()) {
      alert('Error: Please fill in all fields');
      return;
    }
    mutation.mutate({ name: name.trim(), matricNumber: matricNumber.trim() });
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

      <div className="my-8 border-t border-gray-300 dark:border-gray-600 pt-8">
        <ThemedText type="title" className="text-2xl font-bold mb-4">
          Or Upload Multiple Students via CSV
        </ThemedText>
        
        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</span>
            <div className="flex-1">
              <ThemedText className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                CSV Format Instructions:
              </ThemedText>
              <ThemedText className="text-blue-700 dark:text-blue-300 text-sm">
                Your CSV file must have these exact column headers:
              </ThemedText>
              <div className="bg-white dark:bg-gray-800 rounded p-2 mt-2 font-mono text-sm">
                <ThemedText>name,matricNumber</ThemedText>
              </div>
              <ThemedText className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                Example:
              </ThemedText>
              <div className="bg-white dark:bg-gray-800 rounded p-2 mt-1 font-mono text-xs">
                <ThemedText>name,matricNumber</ThemedText>
                <ThemedText>John Doe,2021001</ThemedText>
                <ThemedText>Jane Smith,2021002</ThemedText>
              </div>
            </div>
          </div>
        </div>

        {/* Download Sample */}
        <div className="mb-4">
          <button
            onClick={() => {
              const csv = 'name,matricNumber\nJohn Doe,2021001\nJane Smith,23D/208CSC/586\nMichael Johnson,23/208CSC/587';
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sample-students.csv';
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="bg-gray-500 hover:bg-gray-600 py-2 px-4 rounded-lg text-white font-semibold text-sm transition-colors inline-flex items-center gap-2"
          >
            <span>📥</span>
            Download Sample CSV
          </button>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <ThemedText className="mb-2 font-semibold">Select CSV File</ThemedText>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="w-full border border-gray-300 p-2 rounded-lg dark:text-white dark:bg-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
          />
          {file && (
            <ThemedText className="text-green-600 dark:text-green-400 text-sm mt-2">
              ✓ Selected: {file.name}
            </ThemedText>
          )}
        </div>
        
        <button
          className="w-full bg-green-500 hover:bg-green-600 py-3 px-5 rounded-lg text-white font-bold text-center disabled:opacity-50 transition-colors"
          onClick={handleBulkUpload}
          disabled={!file || bulkMutation.isPending}
        >
          {bulkMutation.isPending ? 'Uploading...' : 'Upload CSV and Add Students'}
        </button>
      </div>

    </ThemedView>
  );
}