const Ingreso = require('../models/ingreso.model');
const PlanMensual = require('../models/plan.model');
require('dotenv').config();

async function registrarIngreso(req, res) {
  try {
    const { placa, tipo_vehiculo, tipo_registro } = req.body;

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

    const tiposValidos = ['Automovil', 'Campero', 'Camioneta', 'Microbus', 'Motocarro', 'Motocicleta', 'Bicicleta'];
    if (!tiposValidos.includes(tipo_vehiculo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de vehículo no válido'
      });
    }

    const ingresoActivo = await Ingreso.findActivoByPlaca(placa);
    if (ingresoActivo) {
      return res.status(400).json({
        success: false,
        message: 'El vehículo ya tiene un ingreso activo sin salida registrada'
      });
    }

    const cuposOcupados = await Ingreso.getOcupados();
    const totalCupos = parseInt(process.env.TOTAL_CUPOS) || 50;

    if (cuposOcupados >= totalCupos) {
      return res.status(400).json({
        success: false,
        message: 'Parqueadero lleno. No hay cupos disponibles',
        data: { cupos_ocupados: cuposOcupados, total_cupos: totalCupos }
      });
    }

    let esPlanMensual = false;
    let usuarioPlanId = null;
    
    const planActivo = await PlanMensual.findActivoByPlaca(placa);
    if (planActivo) {
      esPlanMensual = true;
      usuarioPlanId = planActivo.usuario_id;
    }

    const ingresoId = await Ingreso.create({
      placa: placa.toUpperCase(),
      tipo_vehiculo,
      tipo_registro: tipo_registro || 'automatico',
      es_plan_mensual: esPlanMensual,
      usuario_plan_id: usuarioPlanId,
      operario_id: req.usuario.id
    });

    const nuevoIngreso = await Ingreso.findById(ingresoId);

    res.status(201).json({
      success: true,
      message: 'Ingreso registrado exitosamente',
      data: {
        ingreso: nuevoIngreso,
        es_plan_mensual: esPlanMensual,
        cupos_disponibles: totalCupos - (cuposOcupados + 1)
      }
    });

  } catch (error) {
    console.error('Error en registrarIngreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function listarIngresosActivos(req, res) {
  try {
    const ingresos = await Ingreso.getActivos();
    const cuposOcupados = await Ingreso.getOcupados();
    const totalCupos = parseInt(process.env.TOTAL_CUPOS) || 50;

    res.json({
      success: true,
      data: {
        ingresos,
        resumen: {
          total_cupos: totalCupos,
          ocupados: cuposOcupados,
          disponibles: totalCupos - cuposOcupados
        }
      }
    });
  } catch (error) {
    console.error('Error en listarIngresosActivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function verificarPlaca(req, res) {
  try {
    const { placa } = req.params;
    
    if (!placa) {
      return res.status(400).json({
        success: false,
        message: 'Placa requerida'
      });
    }

    const ingresoActivo = await Ingreso.findActivoByPlaca(placa);
    const planActivo = await PlanMensual.findActivoByPlaca(placa);

    res.json({
      success: true,
      data: {
        tiene_ingreso_activo: !!ingresoActivo,
        tiene_plan_activo: !!planActivo,
        ingreso: ingresoActivo || null,
        plan: planActivo || null
      }
    });
  } catch (error) {
    console.error('Error en verificarPlaca:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = { registrarIngreso, listarIngresosActivos, verificarPlaca };