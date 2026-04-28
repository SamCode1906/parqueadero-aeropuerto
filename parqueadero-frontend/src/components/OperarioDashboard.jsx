import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ingresoService, salidaService, tarifaService } from '../services/api';
import toast from 'react-hot-toast';
import CamaraPlaca from './CamaraPlaca';

export default function OperarioDashboard() {
  const { usuario, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('ingreso');
  const [ingresos, setIngresos] = useState([]);
  const [cupos, setCupos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [horaActual, setHoraActual] = useState(new Date());
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [placaIngreso, setPlacaIngreso] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('Automovil');
  const [tipoRegistro, setTipoRegistro] = useState('manual');
  
  const [placaSalida, setPlacaSalida] = useState('');
  const [calculoSalida, setCalculoSalida] = useState(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [calculando, setCalculando] = useState(false);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(() => {
      cargarCupos();
      setHoraActual(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = () => {
    cargarIngresos();
    cargarCupos();
  };

  const cargarIngresos = async () => {
    try {
      const { data } = await ingresoService.activos();
      setIngresos(data.data.ingresos);
    } catch (error) {
      console.error('Error cargando ingresos');
    }
  };

  const cargarCupos = async () => {
    try {
      const { data } = await tarifaService.cupos();
      setCupos(data.data);
    } catch (error) {
      console.error('Error cargando cupos');
    }
  };

  const registrarIngreso = async (e) => {
    e.preventDefault();
    if (!placaIngreso.trim()) return toast.error('Ingrese la placa');
    setLoading(true);
    try {
      await ingresoService.crear({ placa: placaIngreso.toUpperCase(), tipo_vehiculo: tipoVehiculo, tipo_registro: tipoRegistro });
      toast.success('Vehículo registrado');
      setPlacaIngreso('');
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const calcularSalida = async () => {
    if (!placaSalida.trim()) return toast.error('Ingrese la placa');
    setCalculando(true);
    try {
      const { data } = await salidaService.calcular(placaSalida.toUpperCase());
      setCalculoSalida(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
      setCalculoSalida(null);
    } finally {
      setCalculando(false);
    }
  };

  const registrarSalida = async () => {
    setLoading(true);
    try {
      const { data } = await salidaService.registrar({ placa: placaSalida.toUpperCase(), metodo_pago: metodoPago });
      toast.success(data.message || 'Salida registrada');
      setPlacaSalida('');
      setCalculoSalida(null);
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const tipoVehiculos = ['Automovil', 'Campero', 'Camioneta', 'Microbus', 'Motocarro', 'Motocicleta', 'Bicicleta'];
  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo', icon: '💵' },
    { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
    { value: 'qr', label: 'Código QR', icon: '📱' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="6" width="28" height="20" rx="3" stroke="var(--primary)" strokeWidth="1.5"/>
              <rect x="8" y="13" width="16" height="13" rx="2" fill="rgba(0,229,255,0.08)" stroke="var(--primary)" strokeWidth="1.5"/>
              <circle cx="12" cy="22" r="2" fill="var(--primary)"/>
              <circle cx="20" cy="22" r="2" fill="var(--primary)"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SGI Parqueadero</h2>
<span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Aeropuerto Alfonso Bonilla Aragón</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => { setActiveTab('ingreso'); setCalculoSalida(null); }} className={`nav-item ${activeTab === 'ingreso' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2v6l5-3-5-3zM2 8h16v10H2V8z" stroke="currentColor" strokeWidth="1.5"/></svg>
            Registrar Ingreso
          </button>
          <button onClick={() => setActiveTab('salida')} className={`nav-item ${activeTab === 'salida' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 8h16v10H2V8zM14 2l-4 4 4 4" stroke="currentColor" strokeWidth="1.5"/></svg>
            Registrar Salida
          </button>
          <button onClick={() => { setActiveTab('activos'); cargarIngresos(); }} className={`nav-item ${activeTab === 'activos' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="13" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="12" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>
            Vehículos Activos
            {ingresos.length > 0 && <span className="nav-badge">{ingresos.length}</span>}
          </button>
        </nav>

        {cupos && (
          <div className="cupos-widget">
            <div className="cupos-header">
              <span>OCUPACIÓN</span>
              <span className="mono">{cupos.ocupados}/{cupos.total_cupos}</span>
            </div>
            <div className="cupos-bar">
              <div className={`cupos-fill ${cupos.disponibles <= 3 ? 'danger' : cupos.disponibles <= 10 ? 'warning' : ''}`} style={{ width: `${cupos.porcentaje_ocupacion}%` }} />
            </div>
            <div className="cupos-footer">
              <span className={cupos.disponibles <= 3 ? 'text-danger' : 'text-success'}>{cupos.disponibles} disponibles</span>
              <span className="text-muted">{cupos.porcentaje_ocupacion}%</span>
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{usuario?.nombre?.charAt(0)}</div>
            <div>
              <p className="user-name">{usuario?.nombre}</p>
              <p className="user-role">Operario</p>
            </div>
          </div>
          <button onClick={logout} className="btn-logout" title="Cerrar sesión">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 3H3v12h3M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="top-bar">
          <h1 className="page-title">
            {activeTab === 'ingreso' && 'Registro de Ingreso'}
            {activeTab === 'salida' && 'Registro de Salida'}
            {activeTab === 'activos' && 'Vehículos en Parqueadero'}
          </h1>
          <div className="header-info">
            <span className="clock mono">{horaActual.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span className="date">{horaActual.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </header>

        {activeTab === 'ingreso' && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <h3>Nuevo Ingreso</h3>
              <span className={`badge ${tipoRegistro === 'automatico' ? 'badge-info' : 'badge-warning'}`}>{tipoRegistro === 'automatico' ? 'Automático' : 'Manual'}</span>
            </div>
            <form onSubmit={registrarIngreso} className="form-grid">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
  <div className="input-group" style={{ flex: 1 }}>
    <label>Placa *</label>
    <input value={placaIngreso} onChange={(e) => setPlacaIngreso(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={10} />
  </div>
  <button
    type="button"
    onClick={() => setMostrarCamara(true)}
    style={{
      padding: '12px 16px', background: 'var(--bg-input)', color: 'var(--primary)',
      border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)',
      fontWeight: 700, cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap',
    }}
    title="Leer placa con cámara"
  >
    📷 Leer
  </button>
</div>
              <div className="input-group">
                <label>Tipo Vehículo</label>
                <select value={tipoVehiculo} onChange={(e) => setTipoVehiculo(e.target.value)}>
                  {tipoVehiculos.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Registro</label>
                <select value={tipoRegistro} onChange={(e) => setTipoRegistro(e.target.value)}>
                  <option value="manual">Manual</option>
                  <option value="automatico">Automático</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{alignSelf: 'flex-end'}}>
                {loading ? 'Registrando...' : 'Registrar Ingreso'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'salida' && (
          <div className="card animate-fade-in">
            <div className="card-header"><h3>Procesar Salida</h3></div>
            <div className="salida-search">
              <input value={placaSalida} onChange={(e) => { setPlacaSalida(e.target.value.toUpperCase()); setCalculoSalida(null); }} placeholder="Buscar placa..." />
              <button onClick={calcularSalida} disabled={calculando} className="btn-search">
                {calculando ? 'Buscando...' : 'Calcular'}
              </button>
            </div>

            {calculoSalida && (
              <div className="calculo-result animate-slide-in">
                {calculoSalida.tiene_plan_mensual ? (
                  <div className="plan-badge">
                    <span>✅ Plan Mensual Activo</span>
                    <strong>Sin cobro</strong>
                  </div>
                ) : (
                  <>
                    <div className="calculo-grid">
                      <div className="calculo-stat">
                        <span>Horas</span>
                        <strong>{calculoSalida.total_horas}</strong>
                      </div>
                      <div className="calculo-stat">
                        <span>Tarifa base</span>
                        <strong>${Number(calculoSalida.tarifa_primera_hora).toLocaleString()}</strong>
                      </div>
                      <div className="calculo-stat">
                        <span>Adicional</span>
                        <strong>${Number(calculoSalida.tarifa_hora_adicional).toLocaleString()}</strong>
                      </div>
                      <div className="calculo-stat highlight">
                        <span>TOTAL</span>
                        <strong>${Number(calculoSalida.total_pagar).toLocaleString()}</strong>
                      </div>
                    </div>
                    <div className="metodo-pago">
                      <label>Método de Pago</label>
                      <div className="metodo-grid">
                        {metodosPago.map(m => (
                          <button key={m.value} onClick={() => setMetodoPago(m.value)} className={`metodo-btn ${metodoPago === m.value ? 'active' : ''}`}>
                            <span>{m.icon}</span> {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <button onClick={registrarSalida} className="btn-success-full" disabled={loading}>
                  {loading ? 'Procesando...' : 'Confirmar y Registrar Salida'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activos' && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <h3>Vehículos en Parqueadero</h3>
              <span className="badge badge-primary">{ingresos.length} activos</span>
            </div>
            {ingresos.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="16" width="48" height="32" rx="4" stroke="var(--text-muted)" strokeWidth="1.5"/><path d="M22 36h20M22 42h14" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <p>No hay vehículos en este momento</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Placa</th>
                      <th>Tipo</th>
                      <th>Registro</th>
                      <th>Plan</th>
                      <th>Ingreso</th>
                      <th>Permanencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresos.map(ingreso => {
                      const horas = Math.ceil((new Date() - new Date(ingreso.fecha_ingreso)) / 3600000);
                      return (
                        <tr key={ingreso.id}>
                          <td className="mono font-bold" style={{color: 'var(--primary)'}}>{ingreso.placa}</td>
                          <td>{ingreso.tipo_vehiculo}</td>
                          <td><span className={`badge ${ingreso.tipo_registro === 'automatico' ? 'badge-info' : 'badge-warning'}`}>{ingreso.tipo_registro}</span></td>
                          <td><span className={`badge ${ingreso.es_plan_mensual ? 'badge-success' : 'badge-default'}`}>{ingreso.es_plan_mensual ? 'Mensual' : 'Diario'}</span></td>
                          <td className="text-muted">{new Date(ingreso.fecha_ingreso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td><span className={horas > 6 ? 'text-warning' : 'text-muted'}>{horas}h</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
              {mostrarCamara && (
        <CamaraPlaca
          onPlacaDetectada={(placa) => {
            setPlacaIngreso(placa);
            setMostrarCamara(false);
            toast.success(`Placa detectada: ${placa}`);
          }}
          onClose={() => setMostrarCamara(false)}
        />
      )}
      </main>

      <style>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        
        .sidebar {
          width: 280px; background: var(--bg-elevated); border-right: 1px solid var(--border-subtle);
          display: flex; flex-direction: column; padding: 20px; position: sticky; top: 0; height: 100vh;
        }
        .sidebar-brand { display: flex; align-items: center; gap: 12px; padding-bottom: 24px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 20px; }
        .brand-icon { animation: glow 3s ease-in-out infinite; }
        .brand-name { font-size: 20px; font-weight: 900; letter-spacing: 3px; color: var(--primary); }
        .brand-role { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        
        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .nav-item {
          display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md);
          border: none; background: transparent; color: var(--text-muted); font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all var(--transition-fast); font-family: var(--font-family); position: relative;
        }
        .nav-item:hover { background: var(--bg-hover); color: var(--text-secondary); }
        .nav-item.active { background: rgba(0,229,255,0.08); color: var(--primary); font-weight: 600; }
        .nav-badge {
          position: absolute; right: 12px; background: var(--primary); color: #000; font-size: 11px;
          font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); min-width: 22px; text-align: center;
        }
        
        .cupos-widget {
          margin-top: auto; margin-bottom: 16px; padding: 16px; background: var(--bg-surface);
          border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);
        }
        .cupos-header { display: flex; justify-content: space-between; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 10px; }
        .cupos-bar { height: 4px; background: var(--border-default); border-radius: 2px; overflow: hidden; margin-bottom: 8px; }
        .cupos-fill { height: 100%; border-radius: 2px; background: var(--success); transition: width 0.5s; }
        .cupos-fill.warning { background: var(--warning); }
        .cupos-fill.danger { background: var(--danger); animation: pulse 1.5s ease-in-out infinite; }
        .cupos-footer { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; }
        
        .sidebar-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border-subtle); }
        .user-info { display: flex; align-items: center; gap: 10px; }
        .user-avatar { width: 36px; height: 36px; border-radius: var(--radius-full); background: var(--primary); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
        .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .user-role { font-size: 11px; color: var(--text-muted); }
        .btn-logout { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: var(--radius-md); transition: all var(--transition-fast); }
        .btn-logout:hover { background: var(--danger-bg); color: var(--danger); }
        
        .main-content { flex: 1; padding: 32px; overflow: auto; }
        .top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .page-title { font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px; }
        .header-info { text-align: right; }
        .clock { display: block; font-size: 28px; font-weight: 700; color: var(--primary); }
        .date { font-size: 13px; color: var(--text-muted); text-transform: capitalize; }
        
        .card {
          background: var(--bg-elevated); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl); padding: 28px; margin-bottom: 24px;
          box-shadow: var(--shadow-md);
        }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .card-header h3 { font-size: 18px; font-weight: 700; }
        
        .badge {
          padding: 4px 12px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .badge-info { background: var(--info-bg); color: var(--info); }
        .badge-warning { background: var(--warning-bg); color: var(--warning); }
        .badge-success { background: var(--success-bg); color: var(--success); }
        .badge-primary { background: rgba(0,229,255,0.1); color: var(--primary); }
        .badge-default { background: var(--bg-surface); color: var(--text-muted); }
        
        .form-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 16px; align-items: end;
        }
        @media (max-width: 900px) { .form-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
        
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
        
        .btn-primary {
          padding: 12px 28px; background: var(--primary); color: #000; border: none;
          border-radius: var(--radius-md); font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: var(--font-family); transition: all var(--transition-fast); white-space: nowrap;
        }
        .btn-primary:hover { background: var(--primary-dark); box-shadow: 0 0 16px rgba(0,229,255,0.2); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .salida-search { display: flex; gap: 12px; margin-bottom: 24px; }
        .salida-search input { flex: 1; padding: 14px 18px; background: var(--bg-input); border: 1px solid var(--border-default); border-radius: var(--radius-md); color: var(--text-primary); font-size: 16px; font-family: var(--font-family); outline: none; }
        .salida-search input:focus { border-color: var(--border-primary); }
        .btn-search { padding: 14px 24px; background: var(--primary); color: #000; border: none; border-radius: var(--radius-md); font-weight: 700; cursor: pointer; font-family: var(--font-family); }
        
        .calculo-result { margin-top: 24px; padding: 24px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-default); }
        .plan-badge { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--success-bg); border-radius: var(--radius-md); color: var(--success); font-weight: 600; margin-bottom: 16px; }
        .calculo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        @media (max-width: 600px) { .calculo-grid { grid-template-columns: 1fr 1fr; } }
        .calculo-stat { padding: 14px; background: var(--bg-card); border-radius: var(--radius-md); text-align: center; }
        .calculo-stat span { display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
        .calculo-stat strong { font-size: 20px; color: var(--text-primary); font-family: var(--font-mono); }
        .calculo-stat.highlight { background: rgba(255,215,64,0.08); border: 1px solid rgba(255,215,64,0.2); }
        .calculo-stat.highlight strong { color: var(--warning); font-size: 24px; }
        
        .metodo-pago { margin-bottom: 20px; }
        .metodo-pago label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; }
        .metodo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .metodo-btn {
          padding: 12px; background: var(--bg-card); border: 2px solid var(--border-default);
          border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer;
          font-size: 13px; font-weight: 600; font-family: var(--font-family); transition: all var(--transition-fast);
        }
        .metodo-btn:hover { background: var(--bg-hover); }
        .metodo-btn.active { border-color: var(--primary); background: rgba(0,229,255,0.06); color: var(--primary); }
        
        .btn-success-full {
          width: 100%; padding: 16px; background: var(--success); color: #000; border: none;
          border-radius: var(--radius-md); font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: var(--font-family); transition: all var(--transition-fast);
        }
        .btn-success-full:hover { box-shadow: 0 0 20px rgba(0,230,118,0.3); }
        .btn-success-full:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
        .empty-state svg { margin-bottom: 16px; opacity: 0.5; }
        
        .table-wrapper { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th {
          padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 700;
          color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px;
          border-bottom: 1px solid var(--border-default); background: var(--bg-surface);
        }
        .data-table td { padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 14px; }
        .data-table tr:hover td { background: var(--bg-hover); }
        
        .font-bold { font-weight: 700; }
        .text-muted { color: var(--text-muted); }
        .text-success { color: var(--success); }
        .text-warning { color: var(--warning); }
        .text-danger { color: var(--danger); }
      `}</style>
    </div>
  );
}