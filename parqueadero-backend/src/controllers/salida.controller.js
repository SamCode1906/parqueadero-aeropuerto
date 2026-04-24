const Ingreso = require('../models/ingreso.model');
const Salida = require('../models/salida.model');
const PlanMensual = require('../models/plan.model');
const Tarifa = require('../models/tarifa.model');
const { calcularTarifa } = require('../utils/tarifa.util');

async function registrarSalida(req, res) {
  try {
    const { placa, metodo_pago } = req.body;

    if (!placa) {
      return res.status(400).json({
        success: false,
        message: 'Placa del vehículo es obligatoria'
      });
    }

    const ingresoActivo = await Ingreso.findActivoByPlaca(placa.toUpperCase());
    if (!ingresoActivo) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró un ingreso activo para esta placa'
      });
    }

    let totalPagar = 0;
    let totalHoras = 0;
    let tarifaAplicada = 0;

    const planActivo = await PlanMensual.findActivoByPlaca(placa.toUpperCase());
    
    if (!planActivo && !ingresoActivo.es_plan_mensual) {
      const tarifa = await Tarifa.getByTipoVehiculo(ingresoActivo.tipo_vehiculo);
      
      if (!tarifa) {
        return res.status(400).json({
          success: false,
          message: 'No se encontró tarifa para este tipo de vehículo'
        });
      }

      const calculo = calcularTarifa(
        ingresoActivo.tipo_vehiculo,
        ingresoActivo.fecha_ingreso,
        tarifa
      );

      totalHoras = calculo.totalHoras;
      totalPagar = calculo.totalPagar;
      tarifaAplicada = calculo.tarifaAplicada;
    }

    const metodoPago = metodo_pago || 'efectivo';
    const metodosValidos = ['efectivo', 'transferencia', 'qr'];
    const metodoFinal = metodosValidos.includes(metodoPago) ? metodoPago : 'efectivo';

    const salidaId = await Salida.create({
      ingreso_id: ingresoActivo.id,
      placa: ingresoActivo.placa,
      tipo_vehiculo: ingresoActivo.tipo_vehiculo,
      fecha_ingreso: ingresoActivo.fecha_ingreso,
      total_horas: totalHoras,
      tarifa_aplicada: tarifaAplicada,
      total_pagar: totalPagar,
      metodo_pago: metodoFinal,
      operario_id: req.usuario.id
    });

    await Ingreso.marcarSalida(ingresoActivo.id);

    res.json({
      success: true,
      message: planActivo ? 
        'Salida registrada exitosamente (Plan Mensual - Sin cobro)' : 
        'Salida registrada exitosamente',
      data: {
        salida_id: salidaId,
        placa: ingresoActivo.placa,
        tipo_vehiculo: ingresoActivo.tipo_vehiculo,
        fecha_ingreso: ingresoActivo.fecha_ingreso,
        fecha_salida: new Date(),
        total_horas: totalHoras,
        total_pagar: totalPagar,
        metodo_pago: metodoFinal,
        es_plan_mensual: !!planActivo
      }
    });

  } catch (error) {
    console.error('Error en registrarSalida:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function calcularValorPagar(req, res) {
  try {
    const { placa } = req.params;

    if (!placa) {
      return res.status(400).json({
        success: false,
        message: 'Placa requerida'
      });
    }

    const ingresoActivo = await Ingreso.findActivoByPlaca(placa.toUpperCase());
    if (!ingresoActivo) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró un ingreso activo para esta placa'
      });
    }

    const planActivo = await PlanMensual.findActivoByPlaca(placa.toUpperCase());
    
    if (planActivo || ingresoActivo.es_plan_mensual) {
      return res.json({
        success: true,
        data: {
          placa: ingresoActivo.placa,
          fecha_ingreso: ingresoActivo.fecha_ingreso,
          tiene_plan_mensual: true,
          total_pagar: 0,
          mensaje: 'Plan mensual activo - Sin cobro'
        }
      });
    }

    const tarifa = await Tarifa.getByTipoVehiculo(ingresoActivo.tipo_vehiculo);
    
    if (!tarifa) {
      return res.status(400).json({
        success: false,
        message: 'No se encontró tarifa para este tipo de vehículo'
      });
    }

    const calculo = calcularTarifa(
      ingresoActivo.tipo_vehiculo,
      ingresoActivo.fecha_ingreso,
      tarifa
    );

    res.json({
      success: true,
      data: {
        placa: ingresoActivo.placa,
        tipo_vehiculo: ingresoActivo.tipo_vehiculo,
        fecha_ingreso: ingresoActivo.fecha_ingreso,
        total_horas: calculo.totalHoras,
        tarifa_primera_hora: tarifa.primera_hora,
        tarifa_hora_adicional: tarifa.hora_adicional,
        total_pagar: calculo.totalPagar
      }
    });

  } catch (error) {
    console.error('Error en calcularValorPagar:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = { registrarSalida, calcularValorPagar };