const { pool } = require('../config/db');

class Salida {
  static async create(salidaData) {
    const { ingreso_id, placa, tipo_vehiculo, fecha_ingreso, total_horas, tarifa_aplicada, total_pagar, metodo_pago, operario_id } = salidaData;
    const [result] = await pool.execute(
      `INSERT INTO salidas (ingreso_id, placa, tipo_vehiculo, fecha_ingreso, fecha_salida, total_horas, tarifa_aplicada, total_pagar, metodo_pago, operario_id) 
       VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
      [ingreso_id, placa, tipo_vehiculo, fecha_ingreso, total_horas, tarifa_aplicada, total_pagar, metodo_pago, operario_id]
    );
    return result.insertId;
  }

  static async getHistorial(fechaInicio, fechaFin) {
    const [rows] = await pool.execute(
      `SELECT s.*, u.nombre_completo as operario_nombre 
       FROM salidas s 
       LEFT JOIN usuarios u ON s.operario_id = u.id 
       WHERE s.fecha_salida BETWEEN ? AND ? 
       ORDER BY s.fecha_salida DESC`,
      [fechaInicio, fechaFin]
    );
    return rows;
  }

  static async getTotalIngresos(fechaInicio, fechaFin) {
    const [rows] = await pool.execute(
      `SELECT COALESCE(SUM(total_pagar), 0) as total 
       FROM salidas 
       WHERE fecha_salida BETWEEN ? AND ?`,
      [fechaInicio, fechaFin]
    );
    return rows[0].total;
  }
}

module.exports = Salida;