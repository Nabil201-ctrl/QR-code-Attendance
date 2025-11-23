import { useState, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/Adminlayout';
import RootLayout from './layouts/RootLayout';
import AddStudentScreen from './pages/AddStudentScreen';
import AdminScreen from './pages/AdminScreen';
import EditStudentScreen from './pages/EditStudentScreen';
import GenerateQrScreen from './pages/GenerateQrScreen';
import Index from './pages/Index';
import StudentsScreen from './pages/StudentsScreen';
import LoginScreen from './pages/LoginScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isAdminAuthenticated') === 'true';
    setIsAuthenticated(loggedIn);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Index />} />
          <Route path="login" element={<LoginScreen onLogin={handleLogin} />} />
          <Route 
            path="admin/*" 
            element={
              isAuthenticated ? (
                <AdminLayout onLogout={handleLogout}>
                  <Routes>
                    <Route index element={<AdminScreen />} />
                    <Route path="generate-qr" element={<GenerateQrScreen />} />
                    <Route path="students" element={<StudentsScreen />} />
                    <Route path="add-student" element={<AddStudentScreen />} />
                    <Route path="edit-student/:id" element={<EditStudentScreen />} />
                  </Routes>
                </AdminLayout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;