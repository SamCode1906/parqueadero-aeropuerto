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
  const [sugerenciasPlacas, setSugerenciasPlacas] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(() => { cargarCupos(); setHoraActual(new Date()); }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (!e.target.closest('.sug-container')) setMostrarSugerencias(false); };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const cargarDatos = () => { cargarIngresos(); cargarCupos(); };
  const cargarIngresos = async () => {
    try { const { data } = await ingresoService.activos(); setIngresos(data.data.ingresos || []); } catch (error) {}
  };
  const cargarCupos = async () => {
    try { const { data } = await tarifaService.cupos(); setCupos(data.data); } catch (error) {}
  };
  
  const cargarHistorial = async () => {
    try {
      const { data } = await salidaService.historialHoy();
      setHistorial(data.data || []);
    } catch {
      try {
        const { data } = await tarifaService.reportes(
          new Date().toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        );
        setHistorial(data.data?.detalle_salidas || []);
      } catch {
        setHistorial([]);
      }
    }
  };

  const filtrarPlacas = (texto) => {
    if (texto.length >= 1) {
      const f = ingresos.filter(i => i.placa.toUpperCase().startsWith(texto.toUpperCase()));
      setSugerenciasPlacas(f); setMostrarSugerencias(f.length > 0);
    } else { setSugerenciasPlacas([]); setMostrarSugerencias(false); }
  };

  const registrarIngreso = async (e) => {
    e.preventDefault();
    if (!placaIngreso.trim()) return toast.error('Ingrese la placa');
    setLoading(true);
    try {
      await ingresoService.crear({ placa: placaIngreso.toUpperCase(), tipo_vehiculo: tipoVehiculo, tipo_registro: tipoRegistro });
      toast.success('Ingreso registrado'); setPlacaIngreso(''); cargarDatos();
    } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const calcularSalida = async () => {
    if (!placaSalida.trim()) return toast.error('Ingrese la placa');
    setCalculando(true); setMostrarSugerencias(false);
    try {
      const { data } = await salidaService.calcular(placaSalida.toUpperCase());
      setCalculoSalida(data.data);
    } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
    finally { setCalculando(false); }
  };

  const registrarSalida = async () => {
    setLoading(true);
    try {
      const { data } = await salidaService.registrar({ placa: placaSalida.toUpperCase(), metodo_pago: metodoPago });
      toast.success(data.message); setPlacaSalida(''); setCalculoSalida(null); cargarDatos();
    } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const tipoVehiculos = ['Automovil', 'Campero', 'Camioneta', 'Microbus', 'Motocarro', 'Motocicleta', 'Bicicleta'];

  return (
    <div style={s.layout}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <h2 style={s.brandName}>Parqueadero</h2>
          <span style={s.brandSub}>Aeropuerto Alfonso Bonilla Aragón</span>
        </div>

        <nav style={s.nav}>
          <button onClick={() => setActiveTab('ingreso')} style={{...s.navBtn, ...(activeTab === 'ingreso' ? s.navBtnActive : {})}}>
            Registrar ingreso
          </button>
          <button onClick={() => setActiveTab('salida')} style={{...s.navBtn, ...(activeTab === 'salida' ? s.navBtnActive : {})}}>
            Registrar salida
          </button>
          <button onClick={() => { setActiveTab('activos'); cargarIngresos(); }} style={{...s.navBtn, ...(activeTab === 'activos' ? s.navBtnActive : {})}}>
            Vehículos activos {ingresos.length > 0 && `(${ingresos.length})`}
          </button>
          <button onClick={() => { setActiveTab('historial'); cargarHistorial(); }} style={{...s.navBtn, ...(activeTab === 'historial' ? s.navBtnActive : {})}}>
            Historial de salidas
          </button>
        </nav>

        {cupos && (
          <div style={s.cupos}>
            <div style={s.cuposRow}>
              <span>Ocupación</span>
              <span style={s.mono}>{cupos.ocupados}/{cupos.total_cupos}</span>
            </div>
            <div style={s.bar}>
              <div style={{...s.barFill, width: `${cupos.porcentaje_ocupacion}%`, background: cupos.disponibles <= 3 ? '#dc2626' : '#059669'}} />
            </div>
            <span style={{fontSize: '12px', color: '#6b7280'}}>{cupos.disponibles} disponibles</span>
          </div>
        )}

        <div style={s.userRow}>
          <span style={{fontSize: '13px', color: '#4b5563'}}>{usuario?.nombre}</span>
          <button onClick={logout} style={s.logoutBtn}>Salir</button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.top}>
          <h1 style={s.pageTitle}>
            {activeTab === 'ingreso' && 'Registrar ingreso'}
            {activeTab === 'salida' && 'Registrar salida'}
            {activeTab === 'activos' && 'Vehículos en parqueadero'}
            {activeTab === 'historial' && 'Historial de salidas'}
          </h1>
          <span style={{fontSize: '13px', color: '#6b7280'}}>
            {horaActual.toLocaleDateString('es-CO', {weekday: 'long', day: 'numeric', month: 'long'})} · {horaActual.toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}
          </span>
        </div>

        {/* INGRESO */}
        {activeTab === 'ingreso' && (
          <div style={s.card}>
            <form onSubmit={registrarIngreso} style={s.formGrid}>
              <div style={s.group}>
                <label style={s.label}>Placa</label>
                <div style={{display: 'flex', gap: '6px'}}>
                  <input value={placaIngreso} onChange={e => setPlacaIngreso(e.target.value.toUpperCase())} style={s.input} placeholder="ABC123" />
                  <button type="button" onClick={() => setMostrarCamara(true)} style={s.camBtn} title="Leer placa">📷</button>
                </div>
              </div>
              <div style={s.group}>
                <label style={s.label}>Tipo</label>
                <select value={tipoVehiculo} onChange={e => setTipoVehiculo(e.target.value)} style={s.input}>
                  {tipoVehiculos.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={s.group}>
                <label style={s.label}>Registro</label>
                <select value={tipoRegistro} onChange={e => setTipoRegistro(e.target.value)} style={s.input}>
                  <option value="manual">Manual</option>
                  <option value="automatico">Automático</option>
                </select>
              </div>
              <button type="submit" disabled={loading} style={s.btn}>
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </form>
          </div>
        )}

        {/* SALIDA */}
        {activeTab === 'salida' && (
          <div style={s.card}>
            <div className="sug-container" style={{position: 'relative', marginBottom: '16px'}}>
              <div style={{display: 'flex', gap: '8px'}}>
                <input
                  value={placaSalida}
                  onChange={e => { setPlacaSalida(e.target.value.toUpperCase()); setCalculoSalida(null); filtrarPlacas(e.target.value); }}
                  placeholder="Buscar placa"
                  style={{...s.input, flex: 1}}
                />
                <button onClick={calcularSalida} disabled={calculando} style={s.btn}>
                  {calculando ? '...' : 'Calcular'}
                </button>
              </div>
              {mostrarSugerencias && sugerenciasPlacas.length > 0 && (
                <div style={s.sugDropdown}>
                  {sugerenciasPlacas.map(i => (
                    <div
                      key={i.id}
                      onClick={() => { setPlacaSalida(i.placa); setMostrarSugerencias(false); }}
                      style={s.sugItem}
                    >
                      <span style={{fontWeight: 600, color: '#2563eb'}}>{i.placa}</span>
                      <span style={{fontSize: '12px', color: '#9ca3af'}}>
                        {i.tipo_vehiculo} · {i.es_plan_mensual ? 'Plan' : 'Diario'} · {Math.ceil((new Date() - new Date(i.fecha_ingreso)) / 3600000)}h
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {calculoSalida && (
              <div style={s.calculoBox}>
                {calculoSalida.tiene_plan_mensual ? (
                  <div style={s.planBadge}>Plan mensual activo · Sin cobro</div>
                ) : (
                  <>
                    <div style={s.calculoGrid}>
                      <div style={s.calculoItem}>
                        <div style={s.calculoLabel}>Horas</div>
                        <div style={s.calculoValue}>{calculoSalida.total_horas}</div>
                      </div>
                      <div style={s.calculoItem}>
                        <div style={s.calculoLabel}>Tarifa base</div>
                        <div style={s.calculoValue}>${Number(calculoSalida.tarifa_primera_hora).toLocaleString()}</div>
                      </div>
                      <div style={s.calculoItem}>
                        <div style={s.calculoLabel}>Adicional</div>
                        <div style={s.calculoValue}>${Number(calculoSalida.tarifa_hora_adicional).toLocaleString()}</div>
                      </div>
                      <div style={{...s.calculoItem, border: '1px solid #fcd34d'}}>
                        <div style={s.calculoLabel}>Total</div>
                        <div style={{...s.calculoValue, color: '#d97706', fontSize: '20px'}}>${Number(calculoSalida.total_pagar).toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={s.pagoSection}>
                      <span style={s.pagoLabel}>Método de pago</span>
                      <div style={s.pagoGrid}>
                        {['efectivo', 'transferencia', 'qr'].map(m => (
                          <button
                            key={m}
                            onClick={() => setMetodoPago(m)}
                            style={{
                              ...s.pagoBtn,
                              border: metodoPago === m ? '2px solid #2563eb' : '1px solid #e5e7eb',
                              background: metodoPago === m ? '#dbeafe' : '#fff',
                              color: metodoPago === m ? '#1d4ed8' : '#6b7280',
                            }}
                          >
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <button onClick={registrarSalida} disabled={loading} style={s.confirmBtn}>
                  {loading ? 'Procesando...' : 'Confirmar salida'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ACTIVOS */}
        {activeTab === 'activos' && (
          <div style={s.card}>
            {ingresos.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#9ca3af'}}>
                <p>No hay vehículos en el parqueadero</p>
              </div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Placa</th>
                    <th style={s.th}>Tipo</th>
                    <th style={s.th}>Registro</th>
                    <th style={s.th}>Plan</th>
                    <th style={s.th}>Ingreso</th>
                    <th style={s.th}>Permanencia</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresos.map(i => {
                    const h = Math.ceil((new Date() - new Date(i.fecha_ingreso)) / 3600000);
                    return (
                      <tr key={i.id} style={s.tr}>
                        <td style={{fontWeight: 600, color: '#2563eb'}}>{i.placa}</td>
                        <td>{i.tipo_vehiculo}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                            background: i.tipo_registro === 'automatico' ? '#dbeafe' : '#fef3c7',
                            color: i.tipo_registro === 'automatico' ? '#1d4ed8' : '#92400e',
                          }}>
                            {i.tipo_registro}
                          </span>
                        </td>
                        <td>
                          {i.es_plan_mensual
                            ? <span style={{color: '#059669', fontSize: '12px', fontWeight: 500}}>Mensual</span>
                            : <span style={{color: '#9ca3af', fontSize: '12px'}}>Diario</span>
                          }
                        </td>
                        <td style={{color: '#6b7280'}}>
                          {new Date(i.fecha_ingreso).toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}
                        </td>
                        <td style={{color: h > 6 ? '#d97706' : '#6b7280', fontWeight: h > 6 ? 600 : 400}}>
                          {h}h
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* HISTORIAL */}
        {activeTab === 'historial' && (
          <div style={s.card}>
            {historial.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#9ca3af'}}>
                <p>No hay salidas registradas hoy</p>
              </div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Placa</th>
                    <th style={s.th}>Tipo</th>
                    <th style={s.th}>Ingreso</th>
                    <th style={s.th}>Salida</th>
                    <th style={s.th}>Horas</th>
                    <th style={s.th}>Total</th>
                    <th style={s.th}>Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map(sal => (
                    <tr key={sal.id} style={s.tr}>
                      <td style={{fontWeight: 600, color: '#2563eb'}}>{sal.placa}</td>
                      <td>{sal.tipo_vehiculo}</td>
                      <td style={{color: '#6b7280'}}>
                        {new Date(sal.fecha_ingreso).toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}
                      </td>
                      <td style={{color: '#6b7280'}}>
                        {new Date(sal.fecha_salida).toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}
                      </td>
                      <td>{sal.total_horas}h</td>
                      <td style={{fontWeight: 600}}>${Number(sal.total_pagar).toLocaleString()}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                          background: sal.metodo_pago === 'efectivo' ? '#d1fae5' : sal.metodo_pago === 'transferencia' ? '#dbeafe' : '#fef3c7',
                          color: sal.metodo_pago === 'efectivo' ? '#065f46' : sal.metodo_pago === 'transferencia' ? '#1e40af' : '#92400e',
                        }}>
                          {sal.metodo_pago}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {mostrarCamara && (
        <CamaraPlaca
          onPlacaDetectada={placa => { setPlacaIngreso(placa); setMostrarCamara(false); toast.success(`Placa: ${placa}`); }}
          onClose={() => setMostrarCamara(false)}
        />
      )}
    </div>
  );
}

const s = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f8f9fa' },

  // Sidebar
  sidebar: {
    width: '260px', background: '#fff', borderRight: '1px solid #e5e7eb',
    padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px',
  },
  brand: { paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' },
  brandName: { fontSize: '18px', fontWeight: 700, color: '#1a1a2e', margin: 0 },
  brandSub: { fontSize: '11px', color: '#9ca3af', fontWeight: 500 },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  navBtn: {
    padding: '10px 12px', border: 'none', background: 'transparent', textAlign: 'left',
    fontSize: '14px', color: '#4b5563', borderRadius: '6px', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', transition: '150ms',
  },
  navBtnActive: { background: '#eff6ff', color: '#2563eb', fontWeight: 600 },
  cupos: { padding: '14px', background: '#f9fafb', borderRadius: '8px' },
  cuposRow: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' },
  mono: { fontFamily: 'SF Mono, Menlo, Monaco, monospace' },
  bar: { height: '4px', background: '#e5e7eb', borderRadius: '2px', marginBottom: '6px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '2px', transition: 'width 0.5s' },
  userRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb' },
  logoutBtn: { background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },

  // Main
  main: { flex: 1, padding: '32px', overflow: 'auto' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  pageTitle: { fontSize: '22px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.3px', margin: 0 },

  // Card
  card: { background: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },

  // Form
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '14px', alignItems: 'end' },
  group: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: {
    padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px',
    fontSize: '14px', color: '#1a1a2e', fontFamily: 'Inter, sans-serif', outline: 'none',
    background: '#fff', width: '100%',
  },
  camBtn: {
    padding: '9px 12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px',
    cursor: 'pointer', fontSize: '16px',
  },
  btn: {
    padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', transition: '150ms',
  },

  // Sugerencias
  sugDropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
    border: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px', zIndex: 50,
    boxShadow: '0 4px 6px rgba(0,0,0,0.04)', maxHeight: '200px', overflow: 'auto',
  },
  sugItem: {
    padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },

  // Calculo
  calculoBox: { background: '#f9fafb', padding: '20px', borderRadius: '8px' },
  planBadge: {
    padding: '12px', background: '#d1fae5', borderRadius: '6px',
    color: '#065f46', fontWeight: 600, marginBottom: '12px', textAlign: 'center',
  },
  calculoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' },
  calculoItem: {
    textAlign: 'center', padding: '12px 8px', background: '#fff',
    borderRadius: '6px', border: '1px solid #e5e7eb',
  },
  calculoLabel: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' },
  calculoValue: { fontSize: '16px', fontWeight: 700, color: '#1a1a2e', fontFamily: 'SF Mono, Menlo, Monaco, monospace' },
  pagoSection: { marginBottom: '12px' },
  pagoLabel: { fontSize: '12px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '6px' },
  pagoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' },
  pagoBtn: {
    padding: '8px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: '150ms',
  },
  confirmBtn: {
    width: '100%', padding: '10px', background: '#059669', color: '#fff',
    border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '14px',
    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },

  // Table
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600,
    color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: '1px solid #e5e7eb',
  },
  tr: { borderBottom: '1px solid #f3f4f6' },
};