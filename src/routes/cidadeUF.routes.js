/**
 * Rotas para gerenciamento de Cidades e UFs
 */
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeUserType } = require('../middlewares/authMiddleware');
const cidadeUFController = require('../controllers/cidadeUF.controllers');

// Rota pública para listar todas as cidades
router.get('/', cidadeUFController.listarCidades);

// Rota pública para listar todas as UFs distintas
router.get('/ufs', cidadeUFController.listarUFs);

// Rota pública para listar cidades por UF
router.get('/por-uf/:uf', cidadeUFController.listarCidadesPorUF);

// Rota pública para buscar cidade específica por ID
router.get('/:id', cidadeUFController.buscarCidadePorId);

// Rotas protegidas - apenas administradores podem gerenciar cidades
router.post('/', 
    authenticateToken, 
    cidadeUFController.cadastrarCidade
);

router.put('/:id', 
    authenticateToken, 
    cidadeUFController.atualizarCidade
);

router.delete('/:id', 
    authenticateToken, 
    authorizeUserType('admin'), 
    cidadeUFController.removerCidade
);

module.exports = router;