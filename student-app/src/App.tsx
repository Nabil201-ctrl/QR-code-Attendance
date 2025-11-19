import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import StudentLayout from './layouts/StudentLayout';
import Index from './pages/Index';
import ScanScreen from './pages/ScanScreen';
import StudentScreen from './pages/StudentScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Index />} />
          <Route path="student" element={<StudentLayout />}>
            <Route index element={<StudentScreen />} />
            <Route path="scan" element={<ScanScreen />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;