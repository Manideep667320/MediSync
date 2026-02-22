import { Router, Routes, Route } from './components/Router';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import AccessSelection from './pages/AccessSelection';
import LocalAuth from './pages/LocalAuth';
import LocalDashboard from './pages/LocalDashboard';
import HospitalSelection from './pages/HospitalSelection';
import RoleSelection from './pages/RoleSelection';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/access" element={<AccessSelection />} />
          <Route path="/local-auth" element={<LocalAuth />} />
          <Route
            path="/local-dashboard"
            element={
              <ProtectedRoute requiredRole="local">
                <LocalDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/hospital" element={<HospitalSelection />} />
          <Route path="/hospital/:hospitalId/role" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy/dashboard"
            element={
              <ProtectedRoute requiredRole="pharmacy">
                <PharmacyDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
