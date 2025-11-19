import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminLayout from './layouts/Adminlayout';
import RootLayout from './layouts/RootLayout';
import AddStudentScreen from './pages/AddStudentScreen';
import AdminScreen from './pages/AdminScreen';
import EditStudentScreen from './pages/EditStudentScreen';
import GenerateQrScreen from './pages/GenerateQrScreen';
import Index from './pages/Index';
import StudentsScreen from './pages/StudentsScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Index />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminScreen />} />
            <Route path="generate-qr" element={<GenerateQrScreen />} />
            <Route path="students" element={<StudentsScreen />} />
            <Route path="add-student" element={<AddStudentScreen />} />
            <Route path="edit-student/:id" element={<EditStudentScreen />} />
          </Route>
          {/* Add student routes here when needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;