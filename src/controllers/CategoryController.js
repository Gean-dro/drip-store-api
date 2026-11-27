const { Category } = require('../models');

class CategoryController {
  async create(req, res) {
    try {
      const { name, slug, use_in_menu } = req.body;

      if (!name || !slug) {
        return res.status(400).json({
          message: 'Nome e slug são obrigatórios.',
        });
      }

      const category = await Category.create({
        name,
        slug,
        use_in_menu,
      });

      return res.status(201).json(category);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao criar categoria.',
        error: error.message,
      });
    }
  }

  async search(req, res) {
  try {
    const limit = Math.max(1, parseInt(req.query.limit) || 12);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const offset = (page - 1) * limit;

    const where = {};

    if (req.query.use_in_menu !== undefined) {
      where.use_in_menu = req.query.use_in_menu === 'true';
    }

    const attributes = req.query.fields
      ? req.query.fields.split(',').map(field => field.trim())
      : undefined;

    if (attributes && !attributes.includes('id')) {
      attributes.unshift('id');
    }

    const result = await Category.findAndCountAll({
      where,
      attributes,
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    return res.status(200).json({
      data: result.rows,
      total: result.count,
      limit,
      page,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao pesquisar categorias.',
      error: error.message,
    });
  }
}

  async getById(req, res) {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({
          message: 'Categoria não encontrada.',
        });
      }

      return res.status(200).json(category);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar categoria.',
      });
    }
  }

  async update(req, res) {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({
          message: 'Categoria não encontrada.',
        });
      }

      await category.update(req.body);

      return res.status(200).json(category);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao atualizar categoria.',
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        return res.status(404).json({
          message: 'Categoria não encontrada.',
        });
      }

      await category.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao excluir categoria.',
      });
    }
  }
}

module.exports = new CategoryController();