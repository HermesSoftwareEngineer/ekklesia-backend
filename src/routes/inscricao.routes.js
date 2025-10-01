const express = require('express');
const router = express.Router();
const { 
    buscarInscricao, 
    listarInscricoes, 
    cadastrarInscricao, 
    atualizarInscricao, 
    cancelarInscricao, 
    deletarInscricao, 
    buscarInscricoesPorEvento,
    minhasInscricoes
} = require('../controllers/inscricao.controllers');
const { authenticateToken, authorizeUserType } = require("../middlewares/authMiddleware");
const { isEventoAdmin } = require('../middlewares/eventoAdminMiddleware');
const { calcularPrecos } = require('../middlewares/calculoPrecos.middleware');

// Rota para o usuário ver suas próprias inscrições
router.get("/minhas", authenticateToken, minhasInscricoes);

// Rota para inscrições de um evento específico (somente admin do sistema ou admin do evento)
router.get("/evento/:evento_id", authenticateToken, isEventoAdmin('evento_id'), buscarInscricoesPorEvento);

// Rota para listar todas as inscrições (somente admin do sistema)
router.get("/", authenticateToken, authorizeUserType("admin"), listarInscricoes);

// Rota para buscar inscrição por ID
// Usuários comuns só podem ver suas próprias inscrições (verificação deve estar no controller)
router.get("/:id", authenticateToken, buscarInscricao);

// Rota para cadastrar nova inscrição (qualquer usuário autenticado)
// O middleware calcularPrecos calcula os preços antes de chegar ao controller
router.post("/cadastrar", authenticateToken, calcularPrecos, cadastrarInscricao);

// Rotas para atualizar e cancelar inscrições
// Usuários só podem modificar suas próprias inscrições (verificação deve estar no controller)
// O middleware calcularPrecos também é aplicado na atualização para recalcular os preços se necessário
router.put("/atualizar/:id", authenticateToken, calcularPrecos, atualizarInscricao);
router.patch("/cancelar/:id", authenticateToken, cancelarInscricao);

// Rota para deletar inscrição (somente admin do sistema)
router.delete("/deletar/:id", authenticateToken, authorizeUserType("admin"), deletarInscricao);

module.exports = router;
