const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/evento.controllers');
const { authorizeUserType, authenticateToken } = require('../middlewares/authMiddleware');
const { isEventoAdmin } = require('../middlewares/eventoAdminMiddleware');

// Rota para cadastrar um novo evento (apenas admin do sistema)
router.post('/', authenticateToken, authorizeUserType('admin'), eventoController.criarEvento);

// Rota para buscar evento por ID
router.get('/:id', eventoController.buscarEvento);

// Rota para listar todos os eventos
router.get('/', eventoController.listarEventos);

// Rota para atualizar evento por ID (admin do sistema ou admin do evento)
router.put('/:id', authenticateToken, isEventoAdmin(), eventoController.atualizarEvento);

// Rota para deletar evento por ID (admin do sistema ou admin do evento)
router.delete('/:id', authenticateToken, isEventoAdmin(), eventoController.deletarEvento);

module.exports = router;
