const { pool } = require('../config/db');

class PlanMensual {
  static async create(planData) {
    const { usuario_id, placa, tipo_vehiculo, fecha_inicio, fecha_vencimiento, monto, operario_id } = planData;
    const [result] = await pool.execute(
      `INSERT INTO planes_mensuales (usuario_id, placa, tipo_vehiculo, fecha_inicio, fecha_vencimiento, monto, operario_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuario_id, placa, tipo_vehiculo, fecha_inicio, fecha_vencimiento, monto, operario_id]
    );
    return result.insertId;
  }

  static async findActivoByPlaca(placa) {
    const [rows] = await pool.execute(
      'SELECT * FROM planes_mensuales WHERE placa = ? AND activo = TRUE AND fecha_vencimiento >= CURDATE()',
      [placa]
    );
    return rows[0];
  }

  static async getPlanesActivos() {
    const [rows] = await pool.execute(
      `SELECT pm.*, u.nombre_completo, u.email 
       FROM planes_mensuales pm 
       JOIN usuarios u ON pm.usuario_id = u.id 
       WHERE pm.activo = TRUE 
       ORDER BY pm.fecha_vencimiento`
    );
    return rows;
  }
}

module.exports = PlanMensual;