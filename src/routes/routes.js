const express = require('express')
const router = express.Router()

// Rotas para autenticação
const authRoutes = require('./auth.routes')
router.use("/auth/", authRoutes)

// Rotas para participante
const participanteRoutes = require('./participante.routes');
router.use("/participante/", participanteRoutes);

// Rotas para evento
const eventoRoutes = require('./evento.routes');
router.use("/evento/", eventoRoutes);

module.exports = router;