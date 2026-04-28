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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre_completo || !form.email || !form.password || !form.confirm_password)
      return toast.error('Campos obligatorios incompletos');
    if (form.password !== form.confirm_password) return toast.error('Las contraseñas no coinciden');
    if (form.password.length < 6) return toast.error('Mínimo 6 caracteres');
    
    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Registro exitoso. Inicie sesión');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const tipos = ['Automovil', 'Campero', 'Camioneta', 'Microbus', 'Motocarro', 'Motocicleta', 'Bicicleta'];

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      padding: '24px', background: 'var(--bg-base)'
    }}>
      <div style={{
        width: '100%', maxWidth: '520px', background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)',
        padding: '40px', boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '3px', color: 'var(--primary)', marginBottom: '4px' }}>SKYPARK</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Registro de Cliente</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group"><label>Nombre Completo *</label><input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} placeholder="Juan Pérez" /></div>
          <div className="input-group"><label>Correo Electrónico *</label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="juan@email.com" /></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group"><label>Contraseña *</label><input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••" /></div>
            <div className="input-group"><label>Confirmar *</label><input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} placeholder="••••••" /></div>
          </div>

          <div className="input-group"><label>Identificación</label><input name="identificacion" value={form.identificacion} onChange={handleChange} placeholder="123456789" /></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group"><label>Placa</label><input name="vehiculo_placa" value={form.vehiculo_placa} onChange={handleChange} placeholder="ABC123" /></div>
            <div className="input-group"><label>Tipo Vehículo</label><select name="vehiculo_tipo" value={form.vehiculo_tipo} onChange={handleChange}>{tipos.map(t => <option key={t}>{t}</option>)}</select></div>
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '14px', background: 'var(--primary)', color: '#000', border: 'none',
            borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            marginTop: '8px', fontFamily: 'var(--font-family)'
          }}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Inicia sesión</Link>
        </p>

        <style>{`
          .input-group { display: flex; flex-direction: column; gap: 6px; }
          .input-group label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
          .input-group input, .input-group select {
            padding: 12px 16px; background: var(--bg-input); border: 1px solid var(--border-default);
            border-radius: var(--radius-md); color: var(--text-primary); font-size: 15px;
            font-family: var(--font-family); outline: none; transition: all var(--transition-fast);
          }
          .input-group input:focus, .input-group select:focus {
            border-color: var(--border-primary); box-shadow: 0 0 0 3px rgba(0,229,255,0.06);
          }
        `}</style>
      </div>
    </div>
  );
}