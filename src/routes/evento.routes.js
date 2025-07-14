const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/evento.controllers');
const { authorizeUserType, authenticateToken } = require('../middlewares/authMiddleware');

// Rota para cadastrar um novo evento (apenas admin)
router.post('/', authorizeUserType('admin'), authenticateToken, eventoController.criarEvento);

// Rota para buscar evento por ID
router.get('/:id', eventoController.buscarEvento);

// Rota para listar todos os eventos
router.get('/', eventoController.listarEventos);

// Rota para atualizar evento por ID (apenas admin)
router.put('/:id', authorizeUserType('admin'), authenticateToken, eventoController.atualizarEvento);

module.exports = router;
