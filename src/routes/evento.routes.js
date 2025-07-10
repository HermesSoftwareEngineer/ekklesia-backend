const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/evento.controllers');
const { authorizeUserType, authenticateToken } = require('../middlewares/authMiddleware');

// Rota para cadastrar um novo evento (apenas admin)
router.post('/', authorizeUserType('admin'), authenticateToken, eventoController.criarEvento);

// Rota para buscar evento por ID
router.get('/:id', eventoController.buscarEvento);

module.exports = router;
