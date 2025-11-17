
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import tw from 'twrnc';

export default function AddStudentScreen() {
  return (
    <ThemedView style={tw`flex-1 items-center justify-center p-6`}>
      <ThemedText type="title" style={tw`text-2xl font-bold mb-4`}>
        Add New Student
      </ThemedText>
      <ThemedText style={tw`text-gray-500`}>
        (Form to add student will go here)
      </ThemedText>
    </ThemedView>
  );
}