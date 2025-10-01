const express = require('express');
const router = express.Router();
const eventoAdminController = require('../controllers/eventoAdministrador.controllers');
const { authenticateToken, authorizeUserType } = require('../middlewares/authMiddleware');
const { isEventoAdmin } = require('../middlewares/eventoAdminMiddleware');

// Listar administradores de um evento
router.get("/evento/:evento_id/admins", authenticateToken, isEventoAdmin('evento_id'), eventoAdminController.listarAdministradoresEvento);

// Adicionar um administrador a um evento
router.post("/", authenticateToken, authorizeUserType('admin'), eventoAdminController.adicionarAdministradorEvento);

// Remover um administrador de um evento
router.delete("/evento/:evento_id/admin/:user_id", authenticateToken, authorizeUserType('admin'), eventoAdminController.removerAdministradorEvento);

// Listar eventos administrados pelo usuário logado
router.get("/meus-eventos", authenticateToken, eventoAdminController.listarEventosAdministrados);

// Listar eventos administrados por um usuário específico (apenas admin)
router.get("/usuario/:user_id", authenticateToken, authorizeUserType('admin'), eventoAdminController.listarEventosAdministrados);

module.exports = router;