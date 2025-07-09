const express = require('express');
const router = express.Router();
const { listarParticipantes, buscarParticipante, cadastrarParticipante, atualizarDadosParticipante, deletarParticipante } = require('../controllers/participante.controllers');

const { authenticateToken } = require("../middlewares/authMiddleware");  

router.get("/", authenticateToken, listarParticipantes);
router.get("/:id", authenticateToken, buscarParticipante);
router.post("/cadastrar", authenticateToken, cadastrarParticipante);
router.put("/atualizar/:id", authenticateToken, atualizarDadosParticipante);
router.delete("/deletar/:id", authenticateToken, deletarParticipante);

module.exports = router;