import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    nombre_completo: '', email: '', password: '', confirm_password: '',
    identificacion: '', vehiculo_placa: '', vehiculo_tipo: 'Automovil',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const tipos = ['Automovil', 'Campero', 'Camioneta', 'Microbus', 'Motocarro', 'Motocicleta', 'Bicicleta'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre_completo || !form.email || !form.password || !form.confirm_password)
      return toast.error('Complete los campos obligatorios');
    if (form.password !== form.confirm_password) return toast.error('Las contraseñas no coinciden');
    if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres');
    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Registro exitoso');
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
        <h1 style={styles.title}>Registro de cliente</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.group}><label style={styles.label}>Nombre completo *</label><input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} style={styles.input} placeholder="Juan Pérez" /></div>
          <div style={styles.group}><label style={styles.label}>Correo electrónico *</label><input name="email" type="email" value={form.email} onChange={handleChange} style={styles.input} placeholder="juan@correo.com" /></div>
          <div style={styles.row}>
            <div style={styles.group}><label style={styles.label}>Contraseña *</label><input name="password" type="password" value={form.password} onChange={handleChange} style={styles.input} placeholder="••••••" /></div>
            <div style={styles.group}><label style={styles.label}>Confirmar *</label><input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} style={styles.input} placeholder="••••••" /></div>
          </div>
          <div style={styles.group}><label style={styles.label}>Identificación</label><input name="identificacion" value={form.identificacion} onChange={handleChange} style={styles.input} placeholder="123456789" /></div>
          <div style={styles.row}>
            <div style={styles.group}><label style={styles.label}>Placa</label><input name="vehiculo_placa" value={form.vehiculo_placa} onChange={handleChange} style={styles.input} placeholder="ABC123" /></div>
            <div style={styles.group}><label style={styles.label}>Tipo vehículo</label><select name="vehiculo_tipo" value={form.vehiculo_tipo} onChange={handleChange} style={styles.input}>{tipos.map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
          <button type="submit" disabled={loading} style={styles.button}>{loading ? 'Registrando...' : 'Crear cuenta'}</button>
        </form>
        <p style={styles.footer}>¿Ya tiene cuenta? <Link to="/login" style={styles.link}>Inicie sesión</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px', background: '#f8f9fa' },
  card: { width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '12px', padding: '36px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' },
  title: { fontSize: '22px', fontWeight: 700, color: '#1a1a2e', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  group: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  label: { fontSize: '12px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#1a1a2e', fontFamily: 'Inter, sans-serif', outline: 'none' },
  button: { padding: '11px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: '6px' },
  footer: { textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#6b7280' },
  link: { color: '#2563eb', fontWeight: 600, textDecoration: 'none' },
};