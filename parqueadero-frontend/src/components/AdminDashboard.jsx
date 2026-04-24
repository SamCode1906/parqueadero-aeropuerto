import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tarifaService, ingresoService } from '../services/api';
import toast from 'react-hot-toast';
import { LogOut, DollarSign, Car, BarChart3, Clock, ParkingCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { usuario, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('tarifas');
  const [tarifas, setTarifas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [reportes, setReportes] = useState(null);
  const [editingTarifa, setEditingTarifa] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('2026-04-01');
  const [fechaFin, setFechaFin] = useState('2026-04-30');

  useEffect(() => {
    cargarTarifas();
  }, []);

  const cargarTarifas = async () => {
    try {
      const { data } = await tarifaService.getAll();
      setTarifas(data.data);
    } catch (error) {
      toast.error('Error al cargar tarifas');
    }
  };

  const cargarHistorial = async () => {
    try {
      const { data } = await tarifaService.historial();
      setHistorial(data.data);
    } catch (error) {
      toast.error('Error al cargar historial');
    }
  };

  const cargarReportes = async () => {
    try {
      const { data } = await tarifaService.reportes(fechaInicio, fechaFin);
      setReportes(data.data);
      toast.success('Reporte generado');
    } catch (error) {
      toast.error('Error al generar reporte');
    }
  };

  const guardarTarifa = async (id) => {
    try {
      await tarifaService.update(id, editingTarifa);
      toast.success('Tarifa actualizada');
      setEditingTarifa(null);
      cargarTarifas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <ParkingCircle size={32} color="var(--primary)" />
          <span style={styles.brand}>Admin</span>
        </div>
        <nav style={styles.nav}>
          <button onClick={() => setActiveTab('tarifas')} style={{...styles.navBtn, ...(activeTab === 'tarifas' ? styles.navBtnActive : {})}}>
            <DollarSign size={18} /> Tarifas
          </button>
          <button onClick={() => { setActiveTab('historial'); cargarHistorial(); }} style={{...styles.navBtn, ...(activeTab === 'historial' ? styles.navBtnActive : {})}}>
            <Clock size={18} /> Historial
          </button>
          <button onClick={() => { setActiveTab('reportes'); }} style={{...styles.navBtn, ...(activeTab === 'reportes' ? styles.navBtnActive : {})}}>
            <BarChart3 size={18} /> Reportes
          </button>
        </nav>
        <div style={styles.sidebarFooter}>
          <span>{usuario?.nombre}</span>
          <button onClick={logout} style={styles.logoutBtn}><LogOut size={18} /></button>
        </div>
      </aside>

      <main style={styles.main}>
        <h2 style={styles.pageTitle}>
          {activeTab === 'tarifas' && 'Gestión de Tarifas'}
          {activeTab === 'historial' && 'Historial de Cambios'}
          {activeTab === 'reportes' && 'Generar Reportes'}
        </h2>

        {activeTab === 'tarifas' && (
          <div style={styles.grid}>
            {tarifas.map((tarifa) => (
              <div key={tarifa.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <Car size={24} color="var(--primary)" />
                  <h3>{tarifa.tipo_vehiculo}</h3>
                </div>
                
                {editingTarifa?.id === tarifa.id ? (
                  <div style={styles.editForm}>
                    <label>1ra Hora</label>
                    <input type="number" value={editingTarifa.primera_hora} onChange={(e) => setEditingTarifa({...editingTarifa, primera_hora: e.target.value})} style={styles.input} />
                    <label>Hora Adicional</label>
                    <input type="number" value={editingTarifa.hora_adicional} onChange={(e) => setEditingTarifa({...editingTarifa, hora_adicional: e.target.value})} style={styles.input} />
                    <label>Plan Mensual</label>
                    <input type="number" value={editingTarifa.plan_mensual} onChange={(e) => setEditingTarifa({...editingTarifa, plan_mensual: e.target.value})} style={styles.input} />
                    <div style={styles.btnGroup}>
                      <button onClick={() => guardarTarifa(tarifa.id)} style={styles.btnSuccess}>Guardar</button>
                      <button onClick={() => setEditingTarifa(null)} style={styles.btnDanger}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={styles.tarifaInfo}>
                      <p>1ra Hora: <strong>${Number(tarifa.primera_hora).toLocaleString()}</strong></p>
                      <p>Hora Adicional: <strong>${Number(tarifa.hora_adicional).toLocaleString()}</strong></p>
                      <p>Plan Mensual: <strong>${Number(tarifa.plan_mensual).toLocaleString()}</strong></p>
                    </div>
                    <button onClick={() => setEditingTarifa({...tarifa})} style={styles.btnEdit}>Editar</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'historial' && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>1ra Hora Antes</th>
                  <th>1ra Hora Nueva</th>
                  <th>Hora Adicional Antes</th>
                  <th>Hora Adicional Nueva</th>
                  <th>Plan Antes</th>
                  <th>Plan Nuevo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h) => (
                  <tr key={h.id}>
                    <td>{h.tipo_vehiculo}</td>
                    <td>${h.primera_hora_anterior}</td>
                    <td style={{color: 'var(--success)'}}>${h.primera_hora_nueva}</td>
                    <td>${h.hora_adicional_anterior}</td>
                    <td style={{color: 'var(--success)'}}>${h.hora_adicional_nueva}</td>
                    <td>${h.plan_mensual_anterior}</td>
                    <td style={{color: 'var(--success)'}}>${h.plan_mensual_nuevo}</td>
                    <td>{new Date(h.fecha_modificacion).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div>
            <div style={styles.reporteForm}>
              <div>
                <label>Fecha Inicio</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label>Fecha Fin</label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={styles.input} />
              </div>
              <button onClick={cargarReportes} style={{...styles.btnSuccess, marginTop: '24px'}}>Generar Reporte</button>
            </div>
            
            {reportes && (
              <div style={styles.reporteResult}>
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <h4>Total Ingresos</h4>
                    <p style={{fontSize: '28px', color: 'var(--primary)'}}>{reportes.total_ingresos_vehiculos}</p>
                  </div>
                  <div style={styles.statCard}>
                    <h4>Total Salidas</h4>
                    <p style={{fontSize: '28px', color: 'var(--success)'}}>{reportes.total_salidas}</p>
                  </div>
                  <div style={styles.statCard}>
                    <h4>Total Recaudado</h4>
                    <p style={{fontSize: '28px', color: 'var(--warning)'}}>${reportes.total_recaudado.toLocaleString()}</p>
                  </div>
                  <div style={styles.statCard}>
                    <h4>Planes Activos</h4>
                    <p style={{fontSize: '28px', color: 'var(--primary)'}}>{reportes.planes_activos}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: '250px', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '20px' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', fontSize: '20px', fontWeight: '700', color: 'var(--primary)' },
  brand: { fontSize: '18px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  navBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '15px', cursor: 'pointer', transition: '0.3s' },
  navBtnActive: { background: 'var(--bg-input)', color: 'var(--primary)' },
  sidebarFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '14px' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' },
  main: { flex: 1, padding: '32px', overflow: 'auto' },
  pageTitle: { fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: 'var(--primary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  tarifaInfo: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', color: 'var(--text-muted)' },
  editForm: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: { padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)', outline: 'none', width: '100%' },
  btnGroup: { display: 'flex', gap: '8px', marginTop: '8px' },
  btnSuccess: { padding: '8px 16px', background: 'var(--success)', color: '#0f1923', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  btnDanger: { padding: '8px 16px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  btnEdit: { padding: '8px 16px', background: 'var(--primary)', color: '#0f1923', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', width: '100%' },
  tableContainer: { overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  reporteForm: { display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap' },
  reporteResult: { marginTop: '24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  statCard: { background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' },
};

// Estilos de tabla que faltan
styles.table = { ...styles.table,
  '& th': { background: 'var(--bg-input)', padding: '12px', textAlign: 'left', color: 'var(--primary)', fontSize: '13px' },
  '& td': { padding: '10px 12px', borderBottom: '1px solid var(--border)', fontSize: '13px' },
};