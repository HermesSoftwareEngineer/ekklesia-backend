const express = require('express');
const router = express.Router();
const { buscarParticipante, cadastrarParticipante, atualizarDadosParticipante } = require('../controllers/participante.controllers');
const { authenticateToken } = require("../middlewares/authMiddleware");  

router.get("/:id", authenticateToken, buscarParticipante);
router.post("/cadastrar", authenticateToken, cadastrarParticipante);
router.put("/atualizar", authenticateToken, atualizarDadosParticipante);

module.exports = router;