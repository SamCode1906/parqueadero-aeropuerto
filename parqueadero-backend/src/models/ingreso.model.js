const { pool } = require('../config/db');

class Ingreso {
  static async create(ingresoData) {
    const { placa, tipo_vehiculo, tipo_registro, es_plan_mensual, usuario_plan_id, operario_id } = ingresoData;
    const [result] = await pool.execute(
      `INSERT INTO ingresos (placa, tipo_vehiculo, tipo_registro, es_plan_mensual, usuario_plan_id, fecha_ingreso, operario_id) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [placa, tipo_vehiculo, tipo_registro, es_plan_mensual || false, usuario_plan_id || null, operario_id]
    );
    return result.insertId;
  }

  static async findActivoByPlaca(placa) {
    const [rows] = await pool.execute(
      'SELECT * FROM ingresos WHERE placa = ? AND activo = TRUE',
      [placa]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM ingresos WHERE id = ?', [id]);
    return rows[0];
  }

  static async getActivos() {
    const [rows] = await pool.execute(
      `SELECT i.*, u.nombre_completo as nombre_cliente 
       FROM ingresos i 
       LEFT JOIN usuarios u ON i.usuario_plan_id = u.id 
       WHERE i.activo = TRUE 
       ORDER BY i.fecha_ingreso DESC`
    );
    return rows;
  }

  static async marcarSalida(id) {
    await pool.execute('UPDATE ingresos SET activo = FALSE WHERE id = ?', [id]);
  }

  static async getOcupados() {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as ocupados FROM ingresos WHERE activo = TRUE'
    );
    return rows[0].ocupados;
  }

  static async getHistorial(fechaInicio, fechaFin) {
    const [rows] = await pool.execute(
      `SELECT i.*, s.total_pagar, s.fecha_salida, s.metodo_pago 
       FROM ingresos i 
       LEFT JOIN salidas s ON i.id = s.ingreso_id 
       WHERE i.fecha_ingreso BETWEEN ? AND ? 
       ORDER BY i.fecha_ingreso DESC`,
      [fechaInicio, fechaFin]
    );
    return rows;
  }
}

module.exports = Ingreso;