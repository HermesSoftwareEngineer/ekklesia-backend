const express = require('express')
const router = express.Router()

// Rotas para autenticação
const authRoutes = require('./auth.routes')
router.use("/auth/", authRoutes)

module.exports = router;