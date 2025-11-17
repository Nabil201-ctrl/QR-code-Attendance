
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import tw from 'twrnc';
import { useLocalSearchParams } from 'expo-router';

export default function EditStudentScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={tw`flex-1 items-center justify-center p-6`}>
      <ThemedText type="title" style={tw`text-2xl font-bold mb-4`}>
        Edit Student
      </ThemedText>
      <ThemedText style={tw`text-gray-500`}>
        (Form to edit student with ID: {id} will go here)
      </ThemedText>
    </ThemedView>
  );
}
