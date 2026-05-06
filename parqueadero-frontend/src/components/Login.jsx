import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Complete todos los campos');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Parqueadero Aeropuerto</h1>
          <p style={styles.subtitle}>Alfonso Bonilla Aragón</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.group}>
            <label style={styles.label}>Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="usuario@correo.com" />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={styles.footer}>
          ¿No tiene cuenta? <Link to="/register" style={styles.link}>Regístrese aquí</Link>
        </p>

        <div style={styles.help}>
          <p>Admin: admin@parqueadero.com / admin123</p>
          <p>Operario: operario@parqueadero.com / operario123</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '100vh', padding: '24px', background: '#f8f9fa',
  },
  card: {
    width: '100%', maxWidth: '400px',
    background: '#fff', borderRadius: '12px',
    padding: '40px 36px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    border: '1px solid #e5e7eb',
  },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '22px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.3px' },
  subtitle: { fontSize: '13px', color: '#9ca3af', marginTop: '2px', fontWeight: 500 },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  group: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#4b5563' },
  input: {
    padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px',
    fontSize: '15px', color: '#1a1a2e', background: '#fff', outline: 'none',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 150ms',
  },
  button: {
    padding: '11px', background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', marginTop: '4px', transition: 'background 150ms',
  },
  footer: { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' },
  link: { color: '#2563eb', fontWeight: 600, textDecoration: 'none' },
  help: {
    marginTop: '24px', padding: '12px 14px', background: '#f9fafb',
    borderRadius: '8px', fontSize: '11px', color: '#9ca3af', lineHeight: '1.8',
  },
};