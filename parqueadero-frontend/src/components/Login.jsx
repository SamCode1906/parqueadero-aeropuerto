import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background effects */}
      <div className="bg-effects">
        <div className="bg-grid" />
        <div className="bg-gradient-1" />
        <div className="bg-gradient-2" />
      </div>

      <div className="login-card animate-fade-in">
        {/* Logo & Header */}
        <div className="login-header">
          <div className="logo-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="8" width="40" height="32" rx="4" stroke="var(--primary)" strokeWidth="2"/>
              <path d="M36 20H12V40H36V20Z" fill="var(--primary-glow)" stroke="var(--primary)" strokeWidth="2"/>
              <circle cx="18" cy="34" r="3" fill="var(--primary)"/>
              <circle cx="30" cy="34" r="3" fill="var(--primary)"/>
              <path d="M8 16L16 8" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M40 16L32 8" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '2px' }}>
  Sistema de Gestión Integral
</h1>
<h2 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '4px' }}>
  Parqueadero Aeropuerto
</h2>
<p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Alfonso Bonilla Aragón</p>
          <div className="login-badge">Sistema de Gestión de Parqueadero</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className={`input-field ${focused === 'email' ? 'focused' : ''}`}>
            <label className="input-label">Correo Electrónico</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14v10H3V5z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 5l7 6 7-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="admin@parqueadero.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className={`input-field ${focused === 'password' ? 'focused' : ''}`}>
            <label className="input-label">Contraseña</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 8V6a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="13" r="1" fill="currentColor"/>
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className={`btn-login ${loading ? 'loading' : ''}`} disabled={loading}>
            <span>{loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
            {!loading && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {loading && <div className="spinner" />}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>¿No tienes cuenta? <Link to="/register">Registrarse como cliente</Link></p>
        </div>

        {/* Quick Access */}
        <div className="quick-access">
          <span className="quick-access-label">Acceso rápido</span>
          <div className="quick-access-buttons">
            <button onClick={() => { setEmail('admin@parqueadero.com'); setPassword('admin123'); }} className="quick-btn">
              <span className="quick-dot admin" />
              Admin
            </button>
            <button onClick={() => { setEmail('operario@parqueadero.com'); setPassword('operario123'); }} className="quick-btn">
              <span className="quick-dot operario" />
              Operario
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .bg-effects {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .bg-gradient-1 {
          position: absolute;
          top: -300px;
          right: -300px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%);
        }

        .bg-gradient-2 {
          position: absolute;
          bottom: -200px;
          left: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0,184,212,0.05) 0%, transparent 70%);
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          padding: 48px 40px;
          box-shadow: var(--shadow-lg), var(--shadow-glow);
          backdrop-filter: blur(20px);
        }

        .login-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .logo-icon {
          margin-bottom: 20px;
          animation: glow 3s ease-in-out infinite;
        }

        .login-title {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 4px;
          color: var(--primary);
          text-shadow: 0 0 30px rgba(0,229,255,0.3);
          margin-bottom: 4px;
        }

        .login-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .login-badge {
          display: inline-block;
          padding: 6px 16px;
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-full);
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-left: 4px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
          transition: color var(--transition-fast);
        }

        .input-field.focused .input-icon {
          color: var(--primary);
        }

        .input-wrapper input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: var(--bg-input);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 15px;
          font-family: var(--font-family);
          outline: none;
          transition: all var(--transition-fast);
        }

        .input-wrapper input::placeholder {
          color: var(--text-disabled);
        }

        .input-field.focused .input-wrapper input {
          border-color: var(--border-primary);
          box-shadow: 0 0 0 3px rgba(0,229,255,0.08);
        }

        .input-wrapper input:focus {
          border-color: var(--border-primary);
          box-shadow: 0 0 0 3px rgba(0,229,255,0.08);
        }

        .btn-login {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px 24px;
          background: var(--primary);
          color: #000;
          border: none;
          border-radius: var(--radius-md);
          font-size: 15px;
          font-weight: 700;
          font-family: var(--font-family);
          cursor: pointer;
          transition: all var(--transition-fast);
          letter-spacing: 0.3px;
          margin-top: 4px;
        }

        .btn-login:hover {
          background: var(--primary-dark);
          box-shadow: 0 0 20px rgba(0,229,255,0.3);
          transform: translateY(-1px);
        }

        .btn-login:active {
          transform: translateY(0);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .login-footer a {
          color: var(--primary);
          font-weight: 600;
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .login-footer a:hover {
          color: var(--primary-light);
        }

        .quick-access {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border-subtle);
          text-align: center;
        }

        .quick-access-label {
          display: block;
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }

        .quick-access-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .quick-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-family);
          transition: all var(--transition-fast);
        }

        .quick-btn:hover {
          background: var(--bg-hover);
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        .quick-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .quick-dot.admin {
          background: var(--danger);
          box-shadow: 0 0 8px rgba(255,82,82,0.4);
        }

        .quick-dot.operario {
          background: var(--warning);
          box-shadow: 0 0 8px rgba(255,215,64,0.4);
        }
      `}</style>
    </div>
  );
}