const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  const hash = await bcrypt.hash(contrasena, 10);

  db.query(
    'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
    [nombre, correo, hash, rol || 'cliente'],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: 'Usuario registrado' });
    }
  );
};

exports.login = (req, res) => {
  const { correo, contrasena } = req.body;

  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(400).json({ msg: 'Usuario no existe' });

    const user = result[0];

    const valid = await bcrypt.compare(contrasena, user.contrasena);
    if (!valid) return res.status(400).json({ msg: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user });
  });
};