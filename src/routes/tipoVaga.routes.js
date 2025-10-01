const express = require('express');
const router = express.Router();
const tipoVagaController = require('../controllers/tipoVaga.controllers');
const { authenticateToken, authorizeUserType } = require('../middlewares/authMiddleware');
const { isEventoAdmin } = require('../middlewares/eventoAdminMiddleware');

// Rota base para verificar se o roteador está funcionando
router.get("/status", (req, res) => {
    res.send("API de Tipos de Vaga - Ekklesia Backend");
});

// Listar todos os tipos de vaga (com filtros opcionais)
router.get("/", tipoVagaController.listarTiposVaga);

// Buscar tipo de vaga por ID
router.get("/:id", tipoVagaController.buscarTipoVaga);

// Cadastrar novo tipo de vaga (admin do sistema OU admin do evento)
router.post("/", authenticateToken, tipoVagaController.criarTipoVaga);

// Atualizar tipo de vaga (admin do sistema OU admin do evento)
router.put("/:id", authenticateToken, isEventoAdmin('id', true), tipoVagaController.atualizarTipoVaga);

// Deletar tipo de vaga (admin do sistema OU admin do evento)
router.delete("/:id", authenticateToken, isEventoAdmin('id', true), tipoVagaController.deletarTipoVaga);

module.exports = router;