const express = require('express');
const router = express.Router();
const { buscarParticipante, cadastrarParticipante } = require('../controllers/participante.controllers');
const { authenticateToken } = require("../middlewares/authMiddleware");  

router.get("/:id", authenticateToken, buscarParticipante);
router.post("/cadastrar", authenticateToken, cadastrarParticipante);

module.exports = router;