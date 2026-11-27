const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({
      message: 'Token não informado.',
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(400).json({
      message: 'Formato do token inválido.',
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    return next();
  } catch (error) {
    return res.status(400).json({
      message: 'Token inválido ou expirado.',
    });
  }
}

module.exports = authMiddleware;