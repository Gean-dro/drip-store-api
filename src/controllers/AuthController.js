const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
  async create(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'E-mail e senha são obrigatórios.',
        });
      }

      const user = await User.findOne({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({
          message: 'E-mail ou senha inválidos.',
        });
      }

      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        return res.status(400).json({
          message: 'E-mail ou senha inválidos.',
        });
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        token,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao autenticar usuário.',
      });
    }
  }
}

module.exports = new AuthController();