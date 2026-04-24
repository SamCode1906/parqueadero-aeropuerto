const { pool } = require('../config/db');

class Usuario {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByIdentificacion(identificacion) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE identificacion = ?',
      [identificacion]
    );
    return rows[0];
  }

  static async create(usuarioData) {
    const { nombre_completo, email, password, identificacion, vehiculo_placa, vehiculo_tipo } = usuarioData;
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre_completo, email, password, identificacion, vehiculo_placa, vehiculo_tipo) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_completo, email, password, identificacion, vehiculo_placa || null, vehiculo_tipo || null]
    );
    return result.insertId;
  }

  static async updatePlanStatus(usuarioId, planData) {
    const { plan_activo, plan_inicio, plan_vencimiento } = planData;
    await pool.execute(
      'UPDATE usuarios SET plan_activo = ?, plan_inicio = ?, plan_vencimiento = ? WHERE id = ?',
      [plan_activo, plan_inicio, plan_vencimiento, usuarioId]
    );
  }

  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT id, nombre_completo, email, identificacion, rol_id, plan_activo, plan_inicio, plan_vencimiento, created_at FROM usuarios'
    );
    return rows;
  }
}

module.exports = Usuario;