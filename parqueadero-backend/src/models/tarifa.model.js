const { pool } = require('../config/db');

class Tarifa {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM tarifas WHERE activa = TRUE ORDER BY tipo_vehiculo');
    return rows;
  }

  static async getByTipoVehiculo(tipoVehiculo) {
    const [rows] = await pool.execute(
      'SELECT * FROM tarifas WHERE tipo_vehiculo = ? AND activa = TRUE',
      [tipoVehiculo]
    );
    return rows[0];
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM tarifas WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, tarifaData) {
    const { primera_hora, hora_adicional, plan_mensual } = tarifaData;
    const tarifaAnterior = await this.getById(id);
    
    if (tarifaAnterior) {
      const [result] = await pool.execute(
        `UPDATE tarifas SET primera_hora = ?, hora_adicional = ?, plan_mensual = ? WHERE id = ?`,
        [primera_hora, hora_adicional, plan_mensual, id]
      );
      
      return { tarifaAnterior, updated: result.affectedRows > 0 };
    }
    return null;
  }

  static async registrarHistorial(tarifaAnterior, tarifaNueva, adminId) {
    await pool.execute(
      `INSERT INTO historial_tarifas 
       (tarifa_id, tipo_vehiculo, primera_hora_anterior, primera_hora_nueva, 
        hora_adicional_anterior, hora_adicional_nueva, plan_mensual_anterior, plan_mensual_nuevo, modificado_por) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tarifaAnterior.id,
        tarifaAnterior.tipo_vehiculo,
        tarifaAnterior.primera_hora,
        tarifaNueva.primera_hora,
        tarifaAnterior.hora_adicional,
        tarifaNueva.hora_adicional,
        tarifaAnterior.plan_mensual,
        tarifaNueva.plan_mensual,
        adminId
      ]
    );
  }

  static async getHistorialCambios() {
    const [rows] = await pool.execute(
      `SELECT h.*, u.nombre_completo as administrador 
       FROM historial_tarifas h 
       LEFT JOIN usuarios u ON h.modificado_por = u.id 
       ORDER BY h.fecha_modificacion DESC`
    );
    return rows;
  }
}

module.exports = Tarifa;