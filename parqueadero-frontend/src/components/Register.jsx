import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import toast from 'react-hot-toast';
import { Car, UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    confirm_password: '',
    identificacion: '',
    vehiculo_placa: '',
    vehiculo_tipo: 'Automovil',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre_completo || !formData.email || !formData.password || !formData.confirm_password) {
      toast.error('Los campos marcados con * son obligatorios');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData);
      toast.success('Registro exitoso. Ahora puedes iniciar sesión');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Car size={48} color="var(--primary)" />
          <h1 style={styles.title}>Registro de Cliente</h1>
          <p style={styles.subtitle}>Crea tu cuenta para acceder a planes mensuales</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre Completo *</label>
            <input name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} style={styles.input} placeholder="Juan Pérez" />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico *</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} style={styles.input} placeholder="juan@email.com" />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña *</label>
              <input name="password" type="password" value={formData.password} onChange={handleChange} style={styles.input} placeholder="••••••" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmar *</label>
              <input name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} style={styles.input} placeholder="••••••" />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Identificación</label>
            <input name="identificacion" value={formData.identificacion} onChange={handleChange} style={styles.input} placeholder="123456789" />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Placa del Vehículo</label>
              <input name="vehiculo_placa" value={formData.vehiculo_placa} onChange={handleChange} style={styles.input} placeholder="ABC123" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tipo de Vehículo</label>
              <select name="vehiculo_tipo" value={formData.vehiculo_tipo} onChange={handleChange} style={styles.input}>
                <option>Automovil</option>
                <option>Campero</option>
                <option>Camioneta</option>
                <option>Microbus</option>
                <option>Motocarro</option>
              </select>
            </div>
          </div>
          
          <button type="submit" style={styles.button} disabled={loading}>
            <UserPlus size={20} />
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        
        <div style={styles.footer}>
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 8px 32px rgba(0, 212, 255, 0.1)',
    border: '1px solid var(--border)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  title: { fontSize: '24px', fontWeight: '700', color: 'var(--primary)', marginTop: '10px' },
  subtitle: { color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' },
  input: {
    padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)',
    background: 'var(--bg-input)', color: 'var(--text)', fontSize: '15px', outline: 'none',
  },
  button: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '14px', background: 'var(--primary)', color: '#0f1923', border: 'none',
    borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px',
  },
  footer: { textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' },
};