import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tarifaService } from '../services/api';
import toast from 'react-hot-toast';
import { LogOut, Car, ShoppingCart, CheckCircle, Clock, Calendar } from 'lucide-react';

export default function ClienteDashboard() {
  const { usuario, logout } = useAuth();
  const [tarifas, setTarifas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [activeTab, setActiveTab] = useState('comprar');
  const [formPlan, setFormPlan] = useState({ placa: '', tipo_vehiculo: 'Automovil' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarTarifas();
    cargarPlanes();
  }, []);

  const cargarTarifas = async () => {
    try {
      const { data } = await tarifaService.getAll();
      setTarifas(data.data);
    } catch (error) {
      toast.error('Error al cargar tarifas');
    }
  };

  const cargarPlanes = async () => {
    try {
      const { data } = await tarifaService.planesActivos();
      setPlanes(data.data);
    } catch (error) {
      console.error('Error cargando planes');
    }
  };

  const comprarPlan = async (e) => {
    e.preventDefault();
    if (!formPlan.placa.trim()) {
      toast.error('Ingrese la placa del vehículo');
      return;
    }

    setLoading(true);
    try {
      await tarifaService.planes(formPlan);
      toast.success('Plan mensual activado exitosamente');
      setFormPlan({ placa: '', tipo_vehiculo: 'Automovil' });
      cargarPlanes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al comprar plan');
    } finally {
      setLoading(false);
    }
  };

  const miPlan = planes.find(p => p.usuario_id === usuario?.id);

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <Car size={32} color="var(--primary)" />
          <span style={styles.brand}>Cliente</span>
        </div>
        
        <nav style={styles.nav}>
          <button onClick={() => setActiveTab('comprar')} style={{...styles.navBtn, ...(activeTab === 'comprar' ? styles.navBtnActive : {})}}>
            <ShoppingCart size={18} /> Comprar Plan
          </button>
          <button onClick={() => setActiveTab('miplan')} style={{...styles.navBtn, ...(activeTab === 'miplan' ? styles.navBtnActive : {})}}>
            <CheckCircle size={18} /> Mi Plan
          </button>
          <button onClick={() => setActiveTab('tarifas')} style={{...styles.navBtn, ...(activeTab === 'tarifas' ? styles.navBtnActive : {})}}>
            <Clock size={18} /> Tarifas
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <span style={{fontSize: '13px'}}>{usuario?.nombre}</span>
          <button onClick={logout} style={styles.logoutBtn}><LogOut size={18} /></button>
        </div>
      </aside>

      <main style={styles.main}>
        <h2 style={styles.pageTitle}>
          {activeTab === 'comprar' && 'Comprar Plan Mensual'}
          {activeTab === 'miplan' && 'Mi Plan Actual'}
          {activeTab === 'tarifas' && 'Tarifas Vigentes'}
        </h2>

        {activeTab === 'comprar' && (
          <div style={styles.formCard}>
            <form onSubmit={comprarPlan} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Placa del Vehículo *</label>
                  <input
                    value={formPlan.placa}
                    onChange={(e) => setFormPlan({...formPlan, placa: e.target.value.toUpperCase()})}
                    style={styles.input}
                    placeholder="ABC123"
                    maxLength={10}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tipo de Vehículo</label>
                  <select value={formPlan.tipo_vehiculo} onChange={(e) => setFormPlan({...formPlan, tipo_vehiculo: e.target.value})} style={styles.input}>
                    <option>Automovil</option>
                    <option>Campero</option>
                    <option>Camioneta</option>
                    <option>Microbus</option>
                    <option>Motocarro</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={styles.btnPrimary} disabled={loading}>
                <ShoppingCart size={20} />
                {loading ? 'Procesando...' : 'Comprar Plan Mensual'}
              </button>
            </form>

            <div style={{marginTop: '32px'}}>
              <h3 style={{color: 'var(--text-muted)', marginBottom: '16px', fontSize: '16px'}}>Precios de Planes Mensuales</h3>
              <div style={styles.tarifasGrid}>
                {tarifas.map((t) => (
                  <div key={t.id} style={styles.tarifaMiniCard}>
                    <Car size={20} color="var(--primary)" />
                    <div>
                      <p style={{fontWeight: '600', color: 'var(--text)'}}>{t.tipo_vehiculo}</p>
                      <p style={{color: 'var(--warning)', fontWeight: '700', fontSize: '18px'}}>${Number(t.plan_mensual).toLocaleString()}/mes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'miplan' && (
          <div style={styles.formCard}>
            {miPlan ? (
              <div style={styles.planCard}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
                  <CheckCircle size={40} color="var(--success)" />
                  <h3 style={{color: 'var(--success)', fontSize: '22px'}}>Plan Activo</h3>
                </div>
                
                <div style={styles.planDetails}>
                  <div style={styles.planRow}>
                    <span>Placa:</span>
                    <strong style={{color: 'var(--primary)'}}>{miPlan.placa}</strong>
                  </div>
                  <div style={styles.planRow}>
                    <span>Tipo:</span>
                    <strong>{miPlan.tipo_vehiculo}</strong>
                  </div>
                  <div style={styles.planRow}>
                    <span>Monto:</span>
                    <strong style={{color: 'var(--warning)'}}>${Number(miPlan.monto).toLocaleString()}</strong>
                  </div>
                  <div style={styles.planRow}>
                    <span>Inicio:</span>
                    <strong>{new Date(miPlan.fecha_inicio).toLocaleDateString()}</strong>
                  </div>
                  <div style={styles.planRow}>
                    <span>Vencimiento:</span>
                    <strong>{new Date(miPlan.fecha_vencimiento).toLocaleDateString()}</strong>
                  </div>
                </div>

                <div style={{...styles.planBadge, marginTop: '20px'}}>
                  <Calendar size={18} />
                  <span>
                    Vigente hasta {new Date(miPlan.fecha_vencimiento).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '40px'}}>
                <Car size={64} color="var(--text-muted)" />
                <h3 style={{color: 'var(--text-muted)', marginTop: '16px'}}>No tienes un plan activo</h3>
                <p style={{color: 'var(--text-muted)', marginTop: '8px'}}>Ve a "Comprar Plan" para adquirir uno</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tarifas' && (
          <div style={styles.tarifasGridFull}>
            {tarifas.map((t) => (
              <div key={t.id} style={styles.tarifaCard}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <Car size={28} color="var(--primary)" />
                  <h3 style={{color: 'var(--text)', fontSize: '18px'}}>{t.tipo_vehiculo}</h3>
                </div>
                <div style={styles.tarifaDetailRow}>
                  <span>Primera Hora</span>
                  <strong>${Number(t.primera_hora).toLocaleString()}</strong>
                </div>
                <div style={styles.tarifaDetailRow}>
                  <span>Hora Adicional</span>
                  <strong>${Number(t.hora_adicional).toLocaleString()}</strong>
                </div>
                <div style={{...styles.tarifaDetailRow, borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px'}}>
                  <span>Plan Mensual</span>
                  <strong style={{color: 'var(--warning)', fontSize: '18px'}}>${Number(t.plan_mensual).toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: '260px', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px', position: 'sticky', top: 0, height: '100vh' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' },
  brand: { fontSize: '20px', fontWeight: '700', color: 'var(--primary)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' },
  navBtnActive: { background: 'rgba(0, 212, 255, 0.1)', color: 'var(--primary)', fontWeight: '600' },
  sidebarFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', borderRadius: '6px' },
  main: { flex: 1, padding: '32px', overflow: 'auto' },
  pageTitle: { fontSize: '26px', fontWeight: '700', marginBottom: '28px', color: 'var(--primary)' },
  formCard: { background: 'var(--bg-card)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' },
  label: { fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)', fontSize: '16px', outline: 'none', width: '100%' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 28px', background: 'var(--primary)', color: '#0f1923', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  
  tarifasGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  tarifaMiniCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border)' },
  
  tarifasGridFull: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  tarifaCard: { background: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)' },
  tarifaDetailRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: 'var(--text-muted)', fontSize: '15px' },
  
  planCard: { padding: '16px 0' },
  planDetails: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: 'var(--bg-input)', borderRadius: '10px' },
  planRow: { display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--text-muted)' },
  planBadge: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '10px', color: 'var(--success)', fontWeight: '600', fontSize: '14px' },
};