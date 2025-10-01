/**
 * Rotas para gerenciamento de Categorias de Evento
 */
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeUserType } = require('../middlewares/authMiddleware');
const categoriaEventoController = require('../controllers/categoriaEvento.controllers');

// Rota pública para listar todas as categorias
router.get('/', categoriaEventoController.listarCategorias);

// Rota pública para buscar categoria específica por ID
router.get('/:id', categoriaEventoController.buscarCategoriaPorId);

// Rotas protegidas - apenas administradores podem gerenciar categorias
router.post('/', 
    authenticateToken, 
    authorizeUserType('admin'), 
    categoriaEventoController.cadastrarCategoria
);

router.put('/:id', 
    authenticateToken, 
    authorizeUserType('admin'), 
    categoriaEventoController.atualizarCategoria
);

router.delete('/:id', 
    authenticateToken, 
    authorizeUserType('admin'), 
    categoriaEventoController.removerCategoria
);

module.exports = router;