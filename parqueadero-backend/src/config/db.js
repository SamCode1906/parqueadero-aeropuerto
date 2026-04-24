const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL exitosa');
    connection.release();
  } catch (error) {
    console.error('❌ Error de conexión a MySQL:', error.message);
    process.exit(1);
  }
}

async function initializeDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre_completo VARCHAR(150) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      identificacion VARCHAR(50) UNIQUE,
      rol_id INT DEFAULT 3,
      vehiculo_placa VARCHAR(10),
      vehiculo_tipo VARCHAR(50),
      plan_activo BOOLEAN DEFAULT FALSE,
      plan_inicio DATE,
      plan_vencimiento DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rol_id) REFERENCES roles(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS tarifas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tipo_vehiculo VARCHAR(50) NOT NULL,
      primera_hora DECIMAL(10,2) NOT NULL,
      hora_adicional DECIMAL(10,2) NOT NULL,
      plan_mensual DECIMAL(10,2) DEFAULT 0,
      activa BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS historial_tarifas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tarifa_id INT,
      tipo_vehiculo VARCHAR(50),
      primera_hora_anterior DECIMAL(10,2),
      primera_hora_nueva DECIMAL(10,2),
      hora_adicional_anterior DECIMAL(10,2),
      hora_adicional_nueva DECIMAL(10,2),
      plan_mensual_anterior DECIMAL(10,2),
      plan_mensual_nuevo DECIMAL(10,2),
      modificado_por INT,
      fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (modificado_por) REFERENCES usuarios(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS ingresos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      placa VARCHAR(10) NOT NULL,
      tipo_vehiculo VARCHAR(50) NOT NULL,
      tipo_registro ENUM('manual', 'automatico') DEFAULT 'automatico',
      es_plan_mensual BOOLEAN DEFAULT FALSE,
      usuario_plan_id INT NULL,
      fecha_ingreso DATETIME NOT NULL,
      activo BOOLEAN DEFAULT TRUE,
      operario_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (operario_id) REFERENCES usuarios(id),
      INDEX idx_placa_activo (placa, activo)
    )`,
    
    `CREATE TABLE IF NOT EXISTS salidas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ingreso_id INT NOT NULL,
      placa VARCHAR(10) NOT NULL,
      tipo_vehiculo VARCHAR(50),
      fecha_ingreso DATETIME NOT NULL,
      fecha_salida DATETIME NOT NULL,
      total_horas DECIMAL(10,2),
      tarifa_aplicada DECIMAL(10,2),
      total_pagar DECIMAL(10,2) DEFAULT 0,
      metodo_pago ENUM('efectivo', 'transferencia', 'qr') DEFAULT 'efectivo',
      operario_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ingreso_id) REFERENCES ingresos(id),
      FOREIGN KEY (operario_id) REFERENCES usuarios(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS planes_mensuales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      placa VARCHAR(10) NOT NULL,
      tipo_vehiculo VARCHAR(50),
      fecha_inicio DATE NOT NULL,
      fecha_vencimiento DATE NOT NULL,
      monto DECIMAL(10,2),
      activo BOOLEAN DEFAULT TRUE,
      operario_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (operario_id) REFERENCES usuarios(id)
    )`
  ];

  try {
    for (const query of tables) {
      await pool.execute(query);
    }
    console.log('✅ Tablas inicializadas correctamente');
    await seedData();
  } catch (error) {
    console.error('❌ Error inicializando tablas:', error.message);
  }
}

async function seedData() {
  try {
    const bcrypt = require('bcryptjs');
    
    const [roles] = await pool.execute('SELECT COUNT(*) as count FROM roles');
    if (roles[0].count === 0) {
      await pool.execute("INSERT INTO roles (id, nombre) VALUES (1, 'admin'), (2, 'operario'), (3, 'cliente')");
      console.log('✅ Roles insertados');
    }

    const [usuarios] = await pool.execute('SELECT COUNT(*) as count FROM usuarios WHERE rol_id IN (1, 2)');
    if (usuarios[0].count < 2) {
      const adminHash = await bcrypt.hash('admin123', 10);
      const operarioHash = await bcrypt.hash('operario123', 10);
      
      await pool.execute("DELETE FROM usuarios WHERE email IN ('admin@parqueadero.com', 'operario@parqueadero.com')");
      
      await pool.execute(
        `INSERT INTO usuarios (nombre_completo, email, password, identificacion, rol_id) VALUES 
         ('Administrador', 'admin@parqueadero.com', ?, 'ADMIN001', 1),
         ('Operario General', 'operario@parqueadero.com', ?, 'OPER001', 2)`,
        [adminHash, operarioHash]
      );
      console.log('✅ Admin y Operario insertados');
    }

    const [tarifas] = await pool.execute('SELECT COUNT(*) as count FROM tarifas');
    if (tarifas[0].count === 0) {
      await pool.execute(
        `INSERT INTO tarifas (tipo_vehiculo, primera_hora, hora_adicional, plan_mensual) VALUES 
         ('Automovil', 4300, 3500, 120000),
         ('Campero', 4300, 4000, 150000),
         ('Camioneta', 4300, 4000, 150000),
         ('Microbus', 5000, 4500, 180000),
         ('Motocarro', 3000, 2500, 80000)`
      );
      console.log('✅ Tarifas insertadas');
    }
    
    console.log('✅ Seed completado');
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
  }
}

module.exports = { pool, testConnection, initializeDatabase };