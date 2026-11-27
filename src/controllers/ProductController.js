
const { Op } = require('sequelize');

const sequelize = require('../config/database');
const {
  Product,
  ProductImage,
  ProductOption,
  ProductCategory,
  Category,
} = require('../models');

const productFields = [
  'enabled',
  'name',
  'slug',
  'use_in_menu',
  'stock',
  'description',
  'price',
  'price_with_discount',
];

const productIncludes = [
  { model: ProductImage, as: 'images' },
  { model: ProductOption, as: 'options' },
  {
    model: Category,
    as: 'categories',
    through: { attributes: [] },
  },
];

function normalizeValues(values) {
  return Array.isArray(values) ? JSON.stringify(values) : values;
}

function parseIds(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map(Number))];
  }

  if (typeof value === 'string') {
    return [...new Set(value.split(',').map(Number))];
  }

  return [];
}

async function validateCategories(categoryIds) {
  if (!Array.isArray(categoryIds)) {
    return false;
  }

  if (categoryIds.length === 0) {
    return true;
  }

  const categories = await Category.findAll({
    where: { id: { [Op.in]: categoryIds } },
  });

  return categories.length === categoryIds.length;
}

const ProductController = {
  async create(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        category_ids = [],
        images = [],
        options = [],
      } = req.body;

      if (!req.body.name || !req.body.slug ||
          req.body.price === undefined ||
          req.body.price_with_discount === undefined) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'Informe nome, slug, preço e preço com desconto.',
        });
      }

      if (
        !Array.isArray(category_ids) ||
        !Array.isArray(images) ||
        !Array.isArray(options)
      ) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'Categorias, imagens e opções devem ser listas.',
        });
      }

      const categoriesValid = await validateCategories(category_ids);

      if (!categoriesValid) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'Uma ou mais categorias não existem.',
        });
      }

      const productData = {};

      productFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          productData[field] = req.body[field];
        }
      });

      const product = await Product.create(productData, { transaction });

      if (images.length > 0) {
        await ProductImage.bulkCreate(
          images.map((image) => ({
            product_id: product.id,
            enabled: image.enabled ?? true,
            path: image.path,
          })),
          { transaction }
        );
      }

      if (options.length > 0) {
        await ProductOption.bulkCreate(
          options.map((option) => ({
            product_id: product.id,
            title: option.title,
            shape: option.shape ?? 'square',
            radius: option.radius ?? 0,
            type: option.type ?? 'text',
            values: normalizeValues(option.values),
          })),
          { transaction }
        );
      }

      if (category_ids.length > 0) {
        await ProductCategory.bulkCreate(
          category_ids.map((categoryId) => ({
            product_id: product.id,
            category_id: categoryId,
          })),
          { transaction }
        );
      }

      await transaction.commit();

      const result = await Product.findByPk(product.id, {
        include: productIncludes,
      });

      return res.status(201).json(result);
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      return res.status(500).json({
        message: 'Erro ao cadastrar produto.',
        error: error.message,
      });
    }
  },

 
async search(req, res) {
  try {
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 12)
    );

    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const offset = (page - 1) * limit;
    const where = {};
    const include = [];

    if (req.query.match) {
      where.name = {
        [Op.like]: `%${req.query.match}%`,
      };
    }

    if (req.query['price-range']) {
      const range = req.query['price-range'].split('-').map(Number);

      if (range.length === 2 && range.every(Number.isFinite)) {
        where.price = {
          [Op.between]: [range[0], range[1]],
        };
      }
    }

    if (req.query.category_ids) {
      const categoryIds = parseIds(req.query.category_ids);

      include.push({
        model: Category,
        as: 'categories',
        where: { id: { [Op.in]: categoryIds } },
        through: { attributes: [] },
        required: true,
      });
    } else if (!req.query.fields) {
      include.push({
        model: Category,
        as: 'categories',
        through: { attributes: [] },
      });
    }

    const optionFilters = Object.entries(req.query)
      .filter(([key]) => /^option\[\d+\]$/.test(key));

    if (optionFilters.length > 0) {
      include.push({
        model: ProductOption,
        as: 'options',
        where: {
          [Op.or]: optionFilters.map(([key, value]) => ({
            id: Number(key.match(/\d+/)[0]),
            values: { [Op.like]: `%${value}%` },
          })),
        },
        required: true,
      });
    } else if (!req.query.fields) {
      include.push({
        model: ProductOption,
        as: 'options',
      });
    }

    if (!req.query.fields) {
      include.push({
        model: ProductImage,
        as: 'images',
      });
    }

    let attributes;

    if (req.query.fields) {
      attributes = req.query.fields
        .split(',')
        .map((field) => field.trim())
        .filter((field) => productFields.includes(field));

      if (!attributes.includes('id')) {
        attributes.unshift('id');
      }
    }

    const result = await Product.findAndCountAll({
      where,
      attributes,
      include,
      distinct: true,
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
      message: 'Erro ao pesquisar produtos.',
      error: error.message,
    });
  }
},


  async getById(req, res) {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: productIncludes,
      });

      if (!product) {
        return res.status(404).json({
          message: 'Produto não encontrado.',
        });
      }

      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar produto.',
        error: error.message,
      });
    }
  },

  async update(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          message: 'Produto não encontrado.',
        });
      }

      const {
        category_ids,
        images,
        options,
      } = req.body;

      if (
        category_ids !== undefined &&
        !Array.isArray(category_ids)
      ) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'category_ids deve ser uma lista.',
        });
      }

      if (
        images !== undefined &&
        !Array.isArray(images)
      ) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'images deve ser uma lista.',
        });
      }

      if (
        options !== undefined &&
        !Array.isArray(options)
      ) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'options deve ser uma lista.',
        });
      }

      if (category_ids !== undefined) {
        const categoriesValid = await validateCategories(category_ids);

        if (!categoriesValid) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Uma ou mais categorias não existem.',
          });
        }
      }

      const productData = {};

      productFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          productData[field] = req.body[field];
        }
      });

      await product.update(productData, { transaction });

      if (images !== undefined) {
        await ProductImage.destroy({
          where: { product_id: product.id },
          transaction,
        });

        if (images.length > 0) {
          await ProductImage.bulkCreate(
            images.map((image) => ({
              product_id: product.id,
              enabled: image.enabled ?? true,
              path: image.path,
            })),
            { transaction }
          );
        }
      }

      if (options !== undefined) {
        await ProductOption.destroy({
          where: { product_id: product.id },
          transaction,
        });

        if (options.length > 0) {
          await ProductOption.bulkCreate(
            options.map((option) => ({
              product_id: product.id,
              title: option.title,
              shape: option.shape ?? 'square',
              radius: option.radius ?? 0,
              type: option.type ?? 'text',
              values: normalizeValues(option.values),
            })),
            { transaction }
          );
        }
      }

      if (category_ids !== undefined) {
        await ProductCategory.destroy({
          where: { product_id: product.id },
          transaction,
        });

        if (category_ids.length > 0) {
          await ProductCategory.bulkCreate(
            category_ids.map((categoryId) => ({
              product_id: product.id,
              category_id: categoryId,
            })),
            { transaction }
          );
        }
      }

      await transaction.commit();

      const result = await Product.findByPk(product.id, {
        include: productIncludes,
      });

      return res.status(200).json(result);
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      return res.status(500).json({
        message: 'Erro ao atualizar produto.',
        error: error.message,
      });
    }
  },

  async delete(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          message: 'Produto não encontrado.',
        });
      }

      await ProductImage.destroy({
        where: { product_id: product.id },
        transaction,
      });

      await ProductOption.destroy({
        where: { product_id: product.id },
        transaction,
      });

      await ProductCategory.destroy({
        where: { product_id: product.id },
        transaction,
      });

      await product.destroy({ transaction });

      await transaction.commit();

      return res.status(204).send();
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      return res.status(500).json({
        message: 'Erro ao excluir produto.',
        error: error.message,
      });
    }
  },
};

module.exports = ProductController;
