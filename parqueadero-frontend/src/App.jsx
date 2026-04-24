import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import OperarioDashboard from './components/OperarioDashboard';
import ClienteDashboard from './components/ClienteDashboard';

function PrivateRoute({ children, roles }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--primary)', fontSize: '24px' }}>Cargando...</div>
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/login" />;
  return children;
}

function App() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!usuario ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!usuario ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            {usuario?.rol === 'admin' ? (
              <AdminDashboard />
            ) : usuario?.rol === 'operario' ? (
              <OperarioDashboard />
            ) : (
              <ClienteDashboard />
            )}
          </PrivateRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;