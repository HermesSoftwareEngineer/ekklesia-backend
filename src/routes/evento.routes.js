const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/evento.controllers');
const { authorizeUserType, authenticateToken } = require('../middlewares/authMiddleware');

// Rota para cadastrar um novo evento (apenas admin)
router.post('/', authorizeUserType('admin'), authenticateToken, eventoController.criarEvento);

module.exports = router;
