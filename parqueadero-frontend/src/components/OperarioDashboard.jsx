import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ingresoService, salidaService, tarifaService } from '../services/api';
import toast from 'react-hot-toast';
import { LogOut, Car, ArrowRight, ArrowLeft, ParkingCircle, Search, DollarSign, CheckCircle, CreditCard } from 'lucide-react';

export default function OperarioDashboard() {
  const { usuario, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('ingreso');
  const [ingresos, setIngresos] = useState([]);
  const [cupos, setCupos] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Ingreso
  const [placaIngreso, setPlacaIngreso] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('Automovil');
  const [tipoRegistro, setTipoRegistro] = useState('manual');
  
  // Salida
  const [placaSalida, setPlacaSalida] = useState('');
  const [calculoSalida, setCalculoSalida] = useState(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [calculando, setCalculando] = useState(false);

  useEffect(() => {
    cargarIngresos();
    cargarCupos();
    const interval = setInterval(cargarCupos, 10000);
    return () => clearInterval(interval);
  }, []);

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
    if (!placaIngreso.trim()) {
      toast.error('Ingrese la placa del vehículo');
      return;
    }

    setLoading(true);
    try {
      await ingresoService.crear({
        placa: placaIngreso.toUpperCase(),
        tipo_vehiculo: tipoVehiculo,
        tipo_registro: tipoRegistro,
      });
      toast.success('Ingreso registrado exitosamente');
      setPlacaIngreso('');
      cargarIngresos();
      cargarCupos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar ingreso');
    } finally {
      setLoading(false);
    }
  };

  const calcularSalida = async () => {
    if (!placaSalida.trim()) {
      toast.error('Ingrese la placa del vehículo');
      return;
    }

    setCalculando(true);
    try {
      const { data } = await salidaService.calcular(placaSalida.toUpperCase());
      setCalculoSalida(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al calcular');
      setCalculoSalida(null);
    } finally {
      setCalculando(false);
    }
  };

  const registrarSalida = async () => {
    setLoading(true);
    try {
      const { data } = await salidaService.registrar({
        placa: placaSalida.toUpperCase(),
        metodo_pago: metodoPago,
      });
      toast.success(data.message || 'Salida registrada exitosamente');
      setPlacaSalida('');
      setCalculoSalida(null);
      cargarIngresos();
      cargarCupos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar salida');
    } finally {
      setLoading(false);
    }
  };

  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo', icon: DollarSign },
    { value: 'transferencia', label: 'Transferencia', icon: CreditCard },
    { value: 'qr', label: 'QR', icon: CheckCircle },
  ];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <ParkingCircle size={32} color="var(--primary)" />
          <span style={styles.brand}>Operario</span>
        </div>
        
        <nav style={styles.nav}>
          <button 
            onClick={() => { setActiveTab('ingreso'); setCalculoSalida(null); }} 
            style={{...styles.navBtn, ...(activeTab === 'ingreso' ? styles.navBtnActive : {})}}
          >
            <ArrowRight size={18} /> Registrar Ingreso
          </button>
          <button 
            onClick={() => setActiveTab('salida')} 
            style={{...styles.navBtn, ...(activeTab === 'salida' ? styles.navBtnActive : {})}}
          >
            <ArrowLeft size={18} /> Registrar Salida
          </button>
          <button 
            onClick={() => { setActiveTab('activos'); cargarIngresos(); }} 
            style={{...styles.navBtn, ...(activeTab === 'activos' ? styles.navBtnActive : {})}}
          >
            <Car size={18} /> Vehículos Activos
          </button>
        </nav>

        {/* Cupos en sidebar */}
        {cupos && (
          <div style={styles.cuposWidget}>
            <h4 style={{color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px'}}>CUPOS</h4>
            <div style={styles.cupoBar}>
              <div style={{...styles.cupoFill, width: `${cupos.porcentaje_ocupacion}%`, background: cupos.disponibles > 5 ? 'var(--success)' : 'var(--danger)'}} />
            </div>
            <div style={styles.cupoInfo}>
              <span style={{color: 'var(--success)'}}>{cupos.disponibles} libres</span>
              <span style={{color: 'var(--text-muted)'}}>/ {cupos.total_cupos}</span>
            </div>
          </div>
        )}

        <div style={styles.sidebarFooter}>
          <span style={{fontSize: '13px'}}>{usuario?.nombre}</span>
          <button onClick={logout} style={styles.logoutBtn}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main style={styles.main}>
        {/* Header con cupos */}
        <div style={styles.topBar}>
          <h2 style={styles.pageTitle}>
            {activeTab === 'ingreso' && 'Registrar Ingreso'}
            {activeTab === 'salida' && 'Registrar Salida'}
            {activeTab === 'activos' && 'Vehículos en Parqueadero'}
          </h2>
          {cupos && (
            <div style={styles.cuposBadge}>
              <Car size={16} />
              <span>{cupos.ocupados}/{cupos.total_cupos} ocupados</span>
            </div>
          )}
        </div>

        {/* FORMULARIO DE INGRESO */}
        {activeTab === 'ingreso' && (
          <div style={styles.formCard}>
            <form onSubmit={registrarIngreso} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Placa del Vehículo *</label>
                  <input
                    value={placaIngreso}
                    onChange={(e) => setPlacaIngreso(e.target.value.toUpperCase())}
                    style={styles.input}
                    placeholder="ABC123"
                    maxLength={10}
                    autoFocus
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tipo de Vehículo</label>
                  <select value={tipoVehiculo} onChange={(e) => setTipoVehiculo(e.target.value)} style={styles.input}>
                    <option>Automovil</option>
                    <option>Campero</option>
                    <option>Camioneta</option>
                    <option>Microbus</option>
                    <option>Motocarro</option>
                    <option>Bicicleta</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tipo de Registro</label>
                  <select value={tipoRegistro} onChange={(e) => setTipoRegistro(e.target.value)} style={styles.input}>
                    <option value="manual">Manual</option>
                    <option value="automatico">Automático</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={styles.btnPrimary} disabled={loading}>
                <ArrowRight size={20} />
                {loading ? 'Registrando...' : 'Registrar Ingreso'}
              </button>
            </form>
          </div>
        )}

        {/* FORMULARIO DE SALIDA */}
        {activeTab === 'salida' && (
          <div style={styles.formCard}>
            <div style={styles.formRow}>
              <div style={{...styles.inputGroup, flex: 1}}>
                <label style={styles.label}>Placa del Vehículo *</label>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input
                    value={placaSalida}
                    onChange={(e) => { setPlacaSalida(e.target.value.toUpperCase()); setCalculoSalida(null); }}
                    style={{...styles.input, flex: 1}}
                    placeholder="ABC123"
                    maxLength={10}
                  />
                  <button onClick={calcularSalida} style={styles.btnSearch} disabled={calculando}>
                    <Search size={18} />
                    {calculando ? '...' : 'Calcular'}
                  </button>
                </div>
              </div>
            </div>

            {/* Resultado del cálculo */}
            {calculoSalida && (
              <div style={styles.calculoCard}>
                <div style={styles.calculoHeader}>
                  <Car size={28} color="var(--primary)" />
                  <div>
                    <h3 style={{fontSize: '20px', color: 'var(--text)'}}>{calculoSalida.placa}</h3>
                    <p style={{color: 'var(--text-muted)', fontSize: '14px'}}>{calculoSalida.tipo_vehiculo}</p>
                  </div>
                </div>

                {calculoSalida.tiene_plan_mensual ? (
                  <div style={styles.planMensualBadge}>
                    <CheckCircle size={20} color="var(--success)" />
                    <span>Plan Mensual Activo - Sin cobro</span>
                  </div>
                ) : (
                  <>
                    <div style={styles.calculoDetalle}>
                      <div style={styles.detalleRow}>
                        <span>Total Horas:</span>
                        <strong>{calculoSalida.total_horas} hrs</strong>
                      </div>
                      <div style={styles.detalleRow}>
                        <span>Tarifa 1ra Hora:</span>
                        <strong>${Number(calculoSalida.tarifa_primera_hora).toLocaleString()}</strong>
                      </div>
                      <div style={styles.detalleRow}>
                        <span>Tarifa Hora Adicional:</span>
                        <strong>${Number(calculoSalida.tarifa_hora_adicional).toLocaleString()}</strong>
                      </div>
                    </div>

                    <div style={styles.totalRow}>
                      <span>TOTAL A PAGAR</span>
                      <span style={{fontSize: '32px', color: 'var(--warning)', fontWeight: '700'}}>
                        ${Number(calculoSalida.total_pagar).toLocaleString()}
                      </span>
                    </div>

                    {/* Método de pago */}
                    <div style={{marginTop: '20px'}}>
                      <label style={styles.label}>Método de Pago</label>
                      <div style={styles.metodosGrid}>
                        {metodosPago.map((metodo) => (
                          <button
                            key={metodo.value}
                            onClick={() => setMetodoPago(metodo.value)}
                            style={{
                              ...styles.metodoBtn,
                              ...(metodoPago === metodo.value ? styles.metodoBtnActive : {}),
                            }}
                          >
                            <metodo.icon size={20} />
                            {metodo.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={registrarSalida} style={{...styles.btnPrimary, marginTop: '16px', width: '100%'}} disabled={loading}>
                      <CheckCircle size={20} />
                      {loading ? 'Registrando...' : 'Confirmar Pago y Registrar Salida'}
                    </button>
                  </>
                )}

                {calculoSalida.tiene_plan_mensual && (
                  <button onClick={registrarSalida} style={{...styles.btnPrimary, marginTop: '16px', width: '100%'}} disabled={loading}>
                    <CheckCircle size={20} />
                    {loading ? 'Registrando...' : 'Registrar Salida (Sin Cobro)'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* LISTA DE VEHÍCULOS ACTIVOS */}
        {activeTab === 'activos' && (
          <div style={styles.tableContainer}>
            {ingresos.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>
                <ParkingCircle size={48} />
                <p style={{marginTop: '16px'}}>No hay vehículos en el parqueadero</p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Tipo</th>
                    <th>Registro</th>
                    <th>Plan</th>
                    <th>Fecha Ingreso</th>
                    <th>Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresos.map((ingreso) => (
                    <tr key={ingreso.id}>
                      <td style={{fontWeight: '600', color: 'var(--primary)'}}>{ingreso.placa}</td>
                      <td>{ingreso.tipo_vehiculo}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: ingreso.tipo_registro === 'automatico' ? 'rgba(0,212,255,0.2)' : 'rgba(255,184,0,0.2)',
                          color: ingreso.tipo_registro === 'automatico' ? 'var(--primary)' : 'var(--warning)',
                        }}>
                          {ingreso.tipo_registro}
                        </span>
                      </td>
                      <td>
                        {ingreso.es_plan_mensual ? (
                          <span style={{color: 'var(--success)', fontSize: '12px'}}>Mensual</span>
                        ) : (
                          <span style={{color: 'var(--text-muted)', fontSize: '12px'}}>Diario</span>
                        )}
                      </td>
                      <td>{new Date(ingreso.fecha_ingreso).toLocaleString()}</td>
                      <td>{ingreso.nombre_cliente || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ESTILOS
const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  
  sidebar: { 
    width: '280px', 
    background: 'var(--bg-card)', 
    borderRight: '1px solid var(--border)', 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '24px',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border)',
  },
  brand: { fontSize: '20px', fontWeight: '700', color: 'var(--primary)' },
  
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '12px 16px', 
    borderRadius: '8px', 
    border: 'none', 
    background: 'transparent', 
    color: 'var(--text-muted)', 
    fontSize: '15px', 
    cursor: 'pointer', 
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  navBtnActive: { 
    background: 'rgba(0, 212, 255, 0.1)', 
    color: 'var(--primary)',
    fontWeight: '600',
  },
  
  cuposWidget: {
    padding: '16px',
    background: 'var(--bg-input)',
    borderRadius: '8px',
    marginTop: 'auto',
    marginBottom: '16px',
  },
  cupoBar: {
    height: '6px',
    background: 'var(--border)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  cupoFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s',
  },
  cupoInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: '600',
  },
  
  sidebarFooter: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: '16px', 
    borderTop: '1px solid var(--border)',
    color: 'var(--text-muted)',
  },
  logoutBtn: { 
    background: 'transparent', 
    border: 'none', 
    color: 'var(--danger)', 
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
  
  main: { flex: 1, padding: '32px', overflow: 'auto' },
  
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: { fontSize: '26px', fontWeight: '700', color: 'var(--primary)' },
  
  cuposBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontWeight: '600',
    fontSize: '15px',
  },
  
  formCard: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid var(--border)',
    marginBottom: '24px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' },
  label: { fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-input)',
    color: 'var(--text)',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 28px',
    background: 'var(--primary)',
    color: '#0f1923',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  btnSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 20px',
    background: 'var(--primary)',
    color: '#0f1923',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  
  calculoCard: {
    marginTop: '24px',
    padding: '24px',
    background: 'var(--bg-input)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  calculoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border)',
  },
  planMensualBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '8px',
    color: 'var(--success)',
    fontWeight: '600',
  },
  calculoDetalle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  detalleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--text-muted)',
    fontSize: '15px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    background: 'rgba(255, 184, 0, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 184, 0, 0.3)',
    fontWeight: '700',
    fontSize: '18px',
  },
  
  metodosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginTop: '8px',
  },
  metodoBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '14px',
    background: 'var(--bg-card)',
    border: '2px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  metodoBtnActive: {
    borderColor: 'var(--primary)',
    background: 'rgba(0, 212, 255, 0.1)',
    color: 'var(--primary)',
  },
  
  tableContainer: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
};

// Agregar estilos de tabla
styles.table['& th'] = {
  background: 'var(--bg-input)',
  padding: '14px 16px',
  textAlign: 'left',
  color: 'var(--primary)',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid var(--border)',
};

styles.table['& td'] = {
  padding: '14px 16px',
  borderBottom: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--text)',
};