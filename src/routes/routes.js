const express = require('express')
const router = express.Router()

// Rotas para autenticação
const authRoutes = require('./auth.routes')
router.use("/auth/", authRoutes)

// Rotas para usuários
const usersRoutes = require('./users.routes');
router.use("/users/", usersRoutes);

// Rotas para participante
const participanteRoutes = require('./participante.routes');
router.use("/participante/", participanteRoutes);

// Rotas para evento
const eventoRoutes = require('./evento.routes');
router.use("/evento/", eventoRoutes);

// Rotas para tipo de vaga
const tipoVagaRoutes = require('./tipoVaga.routes');
router.use("/tipo-vaga/", tipoVagaRoutes);

// Rotas para administradores de eventos
const eventoAdministradorRoutes = require('./eventoAdministrador.routes');
router.use("/evento-admin/", eventoAdministradorRoutes);

// Rotas para inscrições
const inscricaoRoutes = require('./inscricao.routes');
router.use("/inscricao/", inscricaoRoutes);

// Rotas para cidades e UFs
const cidadeUFRoutes = require('./cidadeUF.routes');
router.use("/cidade-uf/", cidadeUFRoutes);

module.exports = router;