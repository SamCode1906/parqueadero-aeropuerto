import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tarifaService } from '../services/api';
import toast from 'react-hot-toast';
import api from '../services/api';

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
    const { data } = await tarifaService.miPlan();
    if (data.data) {
      setPlanes([data.data]);
    } else {
      setPlanes([]);
    }
  } catch (error) {
    console.error('Error cargando plan');
    setPlanes([]);
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

  const miPlan = planes.length > 0 ? planes[0] : null;

  const tipoVehiculos = ['Automovil', 'Campero', 'Camioneta', 'Microbus', 'Motocarro', 'Motocicleta', 'Bicicleta'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '260px', background: 'var(--bg-elevated)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', padding: '24px', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SGI Parqueadero</h2>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Aeropuerto Alfonso Bonilla Aragón</span>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <button onClick={() => setActiveTab('comprar')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'comprar' ? 'rgba(33,150,243,0.08)' : 'transparent', color: activeTab === 'comprar' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '14px', fontWeight: activeTab === 'comprar' ? 600 : 500, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
            🛒 Comprar Plan
          </button>
          <button onClick={() => setActiveTab('miplan')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'miplan' ? 'rgba(33,150,243,0.08)' : 'transparent', color: activeTab === 'miplan' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '14px', fontWeight: activeTab === 'miplan' ? 600 : 500, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
            ✅ Mi Plan
          </button>
          <button onClick={() => setActiveTab('tarifas')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'tarifas' ? 'rgba(33,150,243,0.08)' : 'transparent', color: activeTab === 'tarifas' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '14px', fontWeight: activeTab === 'tarifas' ? 600 : 500, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
            💰 Tarifas
          </button>
        </nav>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '13px' }}>{usuario?.nombre}</span>
          <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>🚪</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '28px' }}>
          {activeTab === 'comprar' && 'Comprar Plan Mensual'}
          {activeTab === 'miplan' && 'Mi Plan Actual'}
          {activeTab === 'tarifas' && 'Tarifas Vigentes'}
        </h1>

        {activeTab === 'comprar' && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '32px' }}>
            <form onSubmit={comprarPlan} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Placa *</label>
                  <input value={formPlan.placa} onChange={(e) => setFormPlan({...formPlan, placa: e.target.value.toUpperCase()})} style={{ padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '16px', fontFamily: 'var(--font-family)', outline: 'none' }} placeholder="ABC123" maxLength={10} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tipo Vehículo</label>
                  <select value={formPlan.tipo_vehiculo} onChange={(e) => setFormPlan({...formPlan, tipo_vehiculo: e.target.value})} style={{ padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '16px', fontFamily: 'var(--font-family)', outline: 'none' }}>
                    {tipoVehiculos.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ padding: '14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
                {loading ? 'Procesando...' : 'Comprar Plan Mensual'}
              </button>
            </form>

            <div style={{ marginTop: '32px' }}>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase' }}>Planes Disponibles</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {tarifas.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '20px' }}>🚗</span>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '13px' }}>{t.tipo_vehiculo}</p>
                      <p style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '16px' }}>${Number(t.plan_mensual).toLocaleString()}/mes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'miplan' && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '32px' }}>
            {miPlan ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '40px' }}>✅</span>
                  <h3 style={{ color: 'var(--success)', fontSize: '22px', fontWeight: 700 }}>Plan Activo</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--text-muted)' }}><span>Placa:</span><strong style={{ color: 'var(--primary)' }}>{miPlan.placa}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--text-muted)' }}><span>Tipo:</span><strong>{miPlan.tipo_vehiculo}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--text-muted)' }}><span>Monto:</span><strong style={{ color: 'var(--warning)' }}>${Number(miPlan.monto).toLocaleString()}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--text-muted)' }}><span>Inicio:</span><strong>{new Date(miPlan.fecha_inicio).toLocaleDateString()}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--text-muted)' }}><span>Vencimiento:</span><strong>{new Date(miPlan.fecha_vencimiento).toLocaleDateString()}</strong></div>
                </div>
                <div style={{ marginTop: '20px', padding: '14px 20px', background: 'var(--success-bg)', borderRadius: '10px', color: 'var(--success)', fontWeight: 600, fontSize: '14px' }}>
                  📅 Vigente hasta {new Date(miPlan.fecha_vencimiento).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <span style={{ fontSize: '64px' }}>🚗</span>
                <h3 style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '20px' }}>No tienes un plan activo</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>Ve a "Comprar Plan" para adquirir uno</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tarifas' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {tarifas.map(t => (
              <div key={t.id} style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '24px' }}>🚗</span>
                  <h3 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 700 }}>{t.tipo_vehiculo}</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: 'var(--text-muted)', fontSize: '14px', borderBottom: '1px solid var(--border-subtle)' }}><span>1ra Hora</span><strong>${Number(t.primera_hora).toLocaleString()}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: 'var(--text-muted)', fontSize: '14px', borderBottom: '1px solid var(--border-subtle)' }}><span>Hora Adicional</span><strong>${Number(t.hora_adicional).toLocaleString()}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}><span>Plan Mensual</span><strong style={{ color: 'var(--warning)', fontSize: '18px' }}>${Number(t.plan_mensual).toLocaleString()}</strong></div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}