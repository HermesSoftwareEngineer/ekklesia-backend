const express = require('express');
const router = express.Router();
const { buscarParticipante, cadastrarParticipante } = require('../controllers/participante.controllers');

router.get("/:id", buscarParticipante);
router.post("/cadastrar", cadastrarParticipante);

module.exports = router;