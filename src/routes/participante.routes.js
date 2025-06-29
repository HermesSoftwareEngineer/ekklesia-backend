const express = require('express');
const router = express.Router();
const { buscarParticipante } = require('../controllers/participante.controllers');

router.get("/:id", buscarParticipante)

module.exports = router;