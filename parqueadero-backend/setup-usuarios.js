// setup-usuarios.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupUsuarios() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Conectado a MySQL');
    console.log('🔧 Configurando usuarios del sistema...\n');

    // Asegurar que existen los roles
    await connection.execute(`
      INSERT IGNORE INTO roles (id, nombre) VALUES 
      (1, 'admin'),
      (2, 'operario'),
      (3, 'cliente')
    `);
    console.log('✅ Roles verificados');

    // Generar hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const operarioHash = await bcrypt.hash('operario123', 10);

    // Verificar si existe admin
    const [adminExistente] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      ['admin@parqueadero.com']
    );

    if (adminExistente.length > 0) {
      // Actualizar
      await connection.execute(
        'UPDATE usuarios SET password = ?, rol_id = 1, nombre_completo = ? WHERE email = ?',
        [adminHash, 'Administrador', 'admin@parqueadero.com']
      );
      console.log('✅ Administrador actualizado');
    } else {
      // Crear
      await connection.execute(
        `INSERT INTO usuarios (nombre_completo, email, password, identificacion, rol_id) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Administrador', 'admin@parqueadero.com', adminHash, 'ADMIN001', 1]
      );
      console.log('✅ Administrador creado');
    }

    // Verificar si existe operario
    const [operarioExistente] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      ['operario@parqueadero.com']
    );

    if (operarioExistente.length > 0) {
      // Actualizar
      await connection.execute(
        'UPDATE usuarios SET password = ?, rol_id = 2, nombre_completo = ? WHERE email = ?',
        [operarioHash, 'Operario General', 'operario@parqueadero.com']
      );
      console.log('✅ Operario actualizado');
    } else {
      // Crear
      await connection.execute(
        `INSERT INTO usuarios (nombre_completo, email, password, identificacion, rol_id) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Operario General', 'operario@parqueadero.com', operarioHash, 'OPER001', 2]
      );
      console.log('✅ Operario creado');
    }

    console.log('\n🎉 Configuración completada');
    console.log('\n📋 CREDENCIALES DEL SISTEMA:');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ ADMIN                                       │');
    console.log('│ Email:    admin@parqueadero.com              │');
    console.log('│ Password: admin123                          │');
    console.log('│ Rol:      Administrador                     │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│ OPERARIO                                    │');
    console.log('│ Email:    operario@parqueadero.com           │');
    console.log('│ Password: operario123                       │');
    console.log('│ Rol:      Operario                          │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│ CLIENTES                                    │');
    console.log('│ Se registran en: POST /api/auth/register    │');
    console.log('└─────────────────────────────────────────────┘\n');

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupUsuarios();