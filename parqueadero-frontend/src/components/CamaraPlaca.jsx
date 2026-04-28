import { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';

export default function CamaraPlaca({ onPlacaDetectada, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [placa, setPlaca] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [confianza, setConfianza] = useState(0);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [error, setError] = useState('');
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    iniciarCamara();
    return () => detenerCamara();
  }, []);

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCamaraActiva(true);
        setError('');
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara.');
    }
  };

  const detenerCamara = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCamaraActiva(false);
    }
  };

  // Función para extraer placa colombiana del texto
  const extraerPlacaColombiana = (texto) => {
    // Limpiar texto: solo letras y números, mayúsculas
    const limpio = texto
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/O/g, '0')  // Confusión común O -> 0
      .replace(/I/g, '1')  // Confusión común I -> 1
      .replace(/S/g, '5')  // Confusión común S -> 5
      .replace(/B/g, '8')  // Confusión común B -> 8
      .replace(/Z/g, '2'); // Confusión común Z -> 2

    console.log('Texto limpio:', limpio);

    // Patrones de placas colombianas (en orden de prioridad)
    const patrones = [
      // Placa carro: 3 letras + 3 números = ABC123
      { regex: /^([A-Z]{3})(\d{3})$/, tipo: 'Carro' },
      // Placa carro: 3 letras + 3 números en medio del texto
      { regex: /([A-Z]{3})(\d{3})/, tipo: 'Carro' },
      // Placa moto: 3 letras + 2 números + 1 letra = ABC12D
      { regex: /^([A-Z]{3})(\d{2})([A-Z])$/, tipo: 'Moto' },
      { regex: /([A-Z]{3})(\d{2})([A-Z])/, tipo: 'Moto' },
      // Nuevo formato: 1 letra + 3 números + 2 letras = A123BC
      { regex: /^([A-Z])(\d{3})([A-Z]{2})$/, tipo: 'Nuevo' },
      { regex: /([A-Z])(\d{3})([A-Z]{2})/, tipo: 'Nuevo' },
      // Solo 3 letras + 3 números aunque estén mezclados
      { regex: /([A-Z]{3}\d{3})/, tipo: 'Carro' },
    ];

    for (const patron of patrones) {
      const match = limpio.match(patron.regex);
      if (match) {
        console.log('Patrón encontrado:', patron.tipo, match[0]);
        return match[0].substring(0, 6);
      }
    }

    // Último recurso: buscar 6 caracteres alfanuméricos que parezcan placa
    const posiblePlaca = limpio.match(/[A-Z0-9]{6}/);
    if (posiblePlaca) {
      const candidata = posiblePlaca[0];
      // Verificar que tenga al menos 2 letras y 2 números
      const letras = (candidata.match(/[A-Z]/g) || []).length;
      const numeros = (candidata.match(/[0-9]/g) || []).length;
      if (letras >= 2 && numeros >= 2) {
        return candidata;
      }
    }

    return null;
  };

  const capturarYAnalizar = async () => {
    if (!camaraActiva) return;
    
    setProcesando(true);
    setError('');
    setIntentos(prev => prev + 1);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Preprocesar imagen: aumentar contraste, blanco y negro
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        // Umbral más agresivo para resaltar letras
        const threshold = gray > 100 ? 255 : 0;
        data[i] = threshold;
        data[i + 1] = threshold;
        data[i + 2] = threshold;
      }
      
      ctx.putImageData(imageData, 0, 0);

      // OCR con Tesseract - solo caracteres alfanuméricos
      const result = await Tesseract.recognize(canvas, 'eng', {
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`Procesando: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      console.log('Texto OCR:', result.data.text);
      console.log('Confianza:', result.data.confidence);

      const placaEncontrada = extraerPlacaColombiana(result.data.text);

      if (placaEncontrada) {
        setPlaca(placaEncontrada);
        setConfianza(Math.round(result.data.confidence));
        setError('');
      } else {
        setPlaca('');
        setConfianza(0);
        if (intentos >= 3) {
          setError('No se pudo detectar la placa. Intente con mejor iluminación o ingrese manualmente.');
        } else {
          setError('Placa no detectada. Acerque la cámara y vuelva a intentar.');
        }
      }

    } catch (err) {
      setError('Error al procesar. Intente de nuevo.');
      console.error(err);
    } finally {
      setProcesando(false);
    }
  };

  const confirmarPlaca = () => {
    if (placa) {
      onPlacaDetectada(placa);
    }
  };

  const ingresarManual = () => {
    const manual = prompt('Ingrese la placa manualmente:');
    if (manual && manual.trim().length >= 5) {
      const placaLimpia = manual.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
      onPlacaDetectada(placaLimpia);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px',
    }}>
      <div style={{
        background: 'var(--bg-elevated)', borderRadius: '20px',
        padding: '24px', width: '100%', maxWidth: '500px',
        border: '1px solid var(--border-default)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700 }}>📷 Lector de Placas</h3>
          <button onClick={() => { detenerCamara(); onClose(); }} style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            fontSize: '24px', cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Instrucciones */}
        <div style={{
          background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: '10px',
          marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)',
        }}>
          💡 Acerque la cámara a la placa. Buena iluminación. Placa colombiana (ABC123).
        </div>

        {/* Video */}
        <div style={{
          position: 'relative', background: '#000', borderRadius: '14px',
          overflow: 'hidden', marginBottom: '16px', aspectRatio: '16/9',
          border: placa ? '3px solid var(--success)' : '3px solid var(--border-default)',
        }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {!camaraActiva && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center',
              alignItems: 'center', background: 'rgba(0,0,0,0.8)', color: 'white',
            }}>
              📸 Cámara no disponible
            </div>
          )}

          {procesando && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.7)',
            }}>
              <div style={{
                width: '50px', height: '50px', border: '4px solid var(--border-default)',
                borderTopColor: 'var(--primary)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ color: 'var(--primary)', marginTop: '12px', fontWeight: 600 }}>Analizando placa...</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', background: 'var(--danger-bg)', borderRadius: '10px',
            color: 'var(--danger)', fontSize: '13px', marginBottom: '12px', fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        {/* Placa detectada */}
        {placa && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
            padding: '20px', background: 'var(--bg-surface)', borderRadius: '14px',
            marginBottom: '16px', border: '2px solid var(--success)',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Placa:</span>
            <span style={{
              fontSize: '36px', fontWeight: 900, letterSpacing: '6px',
              color: 'var(--success)', fontFamily: 'var(--font-mono)',
            }}>{placa}</span>
            <span style={{
              fontSize: '11px', color: 'var(--text-muted)',
              background: 'var(--bg-input)', padding: '4px 8px', borderRadius: '6px',
            }}>{confianza}%</span>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={capturarYAnalizar} disabled={procesando || !camaraActiva} style={{
            flex: 1, padding: '14px', background: 'var(--primary)', color: '#000',
            border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px',
            cursor: 'pointer', opacity: procesando ? 0.6 : 1,
          }}>
            {procesando ? 'Procesando...' : `📸 Capturar (${intentos})`}
          </button>
          
          {placa && (
            <button onClick={confirmarPlaca} style={{
              flex: 1, padding: '14px', background: 'var(--success)', color: '#000',
              border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px',
              cursor: 'pointer',
            }}>
              ✅ Usar {placa}
            </button>
          )}
        </div>

        {/* Opción manual */}
        <button onClick={ingresarManual} style={{
          width: '100%', marginTop: '10px', padding: '10px',
          background: 'transparent', border: '1px solid var(--border-default)',
          borderRadius: '10px', color: 'var(--text-muted)', fontSize: '13px',
          cursor: 'pointer', fontWeight: 500,
        }}>
          ⌨️ Ingresar placa manualmente
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}