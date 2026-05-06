const Tarifa = require('../models/tarifa.model');
const PlanMensual = require('../models/plan.model');
const Ingreso = require('../models/ingreso.model');
const Salida = require('../models/salida.model');
require('dotenv').config();

async function getTarifas(req, res) {
  try {
    const tarifas = await Tarifa.getAll();
    
    res.json({
      success: true,
      data: tarifas
    });
  } catch (error) {
    console.error('Error en getTarifas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function actualizarTarifa(req, res) {
  try {
    const { id } = req.params;
    const { primera_hora, hora_adicional, plan_mensual } = req.body;

    if (!primera_hora || !hora_adicional || !plan_mensual) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios: primera_hora, hora_adicional, plan_mensual'
      });
    }

    if (primera_hora < 0 || hora_adicional < 0 || plan_mensual < 0) {
      return res.status(400).json({
        success: false,
        message: 'Los valores no pueden ser negativos'
      });
    }

    const tarifaActualizada = {
      primera_hora: parseFloat(primera_hora),
      hora_adicional: parseFloat(hora_adicional),
      plan_mensual: parseFloat(plan_mensual)
    };

    const resultado = await Tarifa.update(id, tarifaActualizada);
    
    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'Tarifa no encontrada'
      });
    }

    await Tarifa.registrarHistorial(
      resultado.tarifaAnterior,
      { ...resultado.tarifaAnterior, ...tarifaActualizada },
      req.usuario.id
    );

    res.json({
      success: true,
      message: 'Tarifa actualizada exitosamente',
      data: {
        tarifa_anterior: resultado.tarifaAnterior,
        tarifa_nueva: { ...resultado.tarifaAnterior, ...tarifaActualizada }
      }
    });

  } catch (error) {
    console.error('Error en actualizarTarifa:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function getHistorialTarifas(req, res) {
  try {
    const historial = await Tarifa.getHistorialCambios();
    
    res.json({
      success: true,
      data: historial
    });
  } catch (error) {
    console.error('Error en getHistorialTarifas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function comprarPlanMensual(req, res) {
  try {
    const { placa, tipo_vehiculo, tipo_plan } = req.body;

    if (!placa || !tipo_vehiculo) {
      return res.status(400).json({
        success: false,
        message: 'Placa y tipo de vehículo son obligatorios'
      });
    }

    const placaRegex = /^[A-Za-z0-9]{3,10}$/;
    if (!placaRegex.test(placa)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de placa inválido'
      });
    }

    const planExistente = await PlanMensual.findActivoByPlaca(placa.toUpperCase());
    if (planExistente) {
      return res.status(400).json({
        success: false,
        message: 'La placa ya tiene un plan activo'
      });
    }

    const tarifa = await Tarifa.getByTipoVehiculo(tipo_vehiculo);
    if (!tarifa) {
      return res.status(400).json({
        success: false,
        message: 'No se encontró tarifa para este tipo de vehículo'
      });
    }

    const monto = tarifa.plan_mensual;
    const fechaInicio = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

    const planId = await PlanMensual.create({
      usuario_id: req.usuario.id,
      placa: placa.toUpperCase(),
      tipo_vehiculo,
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencimiento,
      monto,
      operario_id: req.usuario.id
    });

    res.status(201).json({
      success: true,
      message: 'Plan mensual activado exitosamente',
      data: {
        plan_id: planId,
        placa: placa.toUpperCase(),
        fecha_inicio: fechaInicio,
        fecha_vencimiento: fechaVencimiento,
        monto
      }
    });

  } catch (error) {
    console.error('Error en comprarPlanMensual:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function getPlanesActivos(req, res) {
  try {
    const planes = await PlanMensual.getPlanesActivos();
    
    res.json({
      success: true,
      data: planes
    });
  } catch (error) {
    console.error('Error en getPlanesActivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function generarReporte(req, res) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Rango de fechas requerido: fecha_inicio y fecha_fin'
      });
    }

    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = new Date(fecha_fin);

    if (isNaN(fechaInicio) || isNaN(fechaFin)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido'
      });
    }

    if (fechaInicio > fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio no puede ser mayor a la fecha fin'
      });
    }

    const ingresos = await Ingreso.getHistorial(fecha_inicio, fecha_fin);
    const salidas = await Salida.getHistorial(fecha_inicio, fecha_fin);
    const totalIngresos = await Salida.getTotalIngresos(fecha_inicio, fecha_fin);
    const planes = await PlanMensual.getPlanesActivos();

    const ingresosDiarios = ingresos.filter(i => i.activo === false).length;

    res.json({
      success: true,
      data: {
        rango: { fecha_inicio, fecha_fin },
        total_ingresos_vehiculos: ingresos.length,
        total_salidas: salidas.length,
        total_recaudado: totalIngresos,
        planes_activos: planes.length,
        detalle_ingresos: ingresos,
        detalle_salidas: salidas
      }
    });

  } catch (error) {
    console.error('Error en generarReporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function consultarCupos(req, res) {
  try {
    const cuposOcupados = await Ingreso.getOcupados();
    const totalCupos = parseInt(process.env.TOTAL_CUPOS) || 50;
    const disponibles = totalCupos - cuposOcupados;

    res.json({
      success: true,
      data: {
        total_cupos: totalCupos,
        ocupados: cuposOcupados,
        disponibles: disponibles,
        porcentaje_ocupacion: ((cuposOcupados / totalCupos) * 100).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error en consultarCupos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}


async function getMiPlan(req, res) {
  try {
    const { pool } = require('../config/db');
    const [rows] = await pool.execute(
      `SELECT pm.*, u.nombre_completo, u.email 
       FROM planes_mensuales pm 
       JOIN usuarios u ON pm.usuario_id = u.id 
       WHERE pm.usuario_id = ? AND pm.activo = TRUE AND pm.fecha_vencimiento >= CURDATE()
       ORDER BY pm.fecha_vencimiento DESC
       LIMIT 1`,
      [req.usuario.id]
    );
    
    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    console.error('Error en getMiPlan:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
}


module.exports = {
  getTarifas,
  actualizarTarifa,
  getHistorialTarifas,
  comprarPlanMensual,
  getPlanesActivos,
  generarReporte,
  consultarCupos,
  getMiPlan
};