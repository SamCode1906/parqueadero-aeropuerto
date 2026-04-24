const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
require('dotenv').config();

async function register(req, res) {
  try {
    const { nombre_completo, email, password, confirm_password, identificacion, vehiculo_placa, vehiculo_tipo } = req.body;

    // ... validaciones existentes ...

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con rol_id = 3 (cliente) explícitamente
    const { pool } = require('../config/db');
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre_completo, email, password, identificacion, vehiculo_placa, vehiculo_tipo, rol_id) 
       VALUES (?, ?, ?, ?, ?, ?, 3)`,
      [nombre_completo, email, hashedPassword, identificacion || null, vehiculo_placa || null, vehiculo_tipo || null]
    );

    res.status(201).json({
      success: true,
      message: 'Registro exitoso. Ahora puede iniciar sesión como cliente.'
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    const usuario = await Usuario.findByEmail(email);
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol_nombre,
        nombre: usuario.nombre_completo
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre_completo,
          email: usuario.email,
          rol: usuario.rol_nombre,
          plan_activo: usuario.plan_activo
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

async function getProfile(req, res) {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        email: usuario.email,
        identificacion: usuario.identificacion,
        rol: usuario.rol_nombre,
        plan_activo: usuario.plan_activo,
        plan_inicio: usuario.plan_inicio,
        plan_vencimiento: usuario.plan_vencimiento,
        vehiculo_placa: usuario.vehiculo_placa,
        vehiculo_tipo: usuario.vehiculo_tipo,
        created_at: usuario.created_at
      }
    });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = { register, login, getProfile };