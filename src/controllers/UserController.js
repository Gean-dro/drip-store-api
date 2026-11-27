const { User } = require('../models');

class UserController {
  async create(req, res) {
    try {
      const { firstname, surname, email, password } = req.body;

      if (!firstname || !surname || !email || !password) {
        return res.status(400).json({
          message: 'Preencha todos os campos obrigatórios.',
        });
      }

      const existingUser = await User.findOne({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Este e-mail já está cadastrado.',
        });
      }

      const user = await User.create({
        firstname,
        surname,
        email,
        password,
      });

      const userResponse = user.toJSON();
      delete userResponse.password;

      return res.status(201).json(userResponse);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao cadastrar usuário.',
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return res.status(404).json({
          message: 'Usuário não encontrado.',
        });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar usuário.',
      });
    }
  }
  async update(req, res) {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado.',
      });
    }

    const { firstname, surname, email, password } = req.body;

    await user.update({
      firstname,
      surname,
      email,
      password,
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.status(200).json(userResponse);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao atualizar usuário.',
      error: error.message,
    });
  }
}
async delete(req, res) {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado.',
      });
    }

    await user.destroy();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao excluir usuário.',
    });
  }
}

}

module.exports = new UserController();