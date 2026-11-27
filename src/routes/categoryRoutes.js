const express = require('express');
const router = express.Router();

const CategoryController = require('../controllers/CategoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, CategoryController.create);
router.get('/search', CategoryController.search);
router.get('/:id', CategoryController.getById);
router.put('/:id', authMiddleware, CategoryController.update);
router.delete('/:id', authMiddleware, CategoryController.delete);

module.exports = router;