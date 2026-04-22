const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ msg: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
};

exports.soloAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'operario') {
    return res.status(403).json({ msg: 'Acceso denegado' });
  }
  next();
};