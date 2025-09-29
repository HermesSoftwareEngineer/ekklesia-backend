const express = require('express');
const router = express.Router();
const { 
    listarUsuarios, 
    buscarUsuario, 
    cadastrarUsuario, 
    atualizarUsuario, 
    deletarUsuario 
} = require('../controllers/users.controllers');
const { authenticateToken, authorizeUserType } = require('../middlewares/authMiddleware');

// Rota base para verificar se o roteador está funcionando
router.get("/", (req, res) => {
    res.send("API de Usuários - Ekklesia Backend");
});

// Rotas CRUD para usuários
// Listar todos os usuários (com filtros opcionais) - Apenas admin
router.get("/list", authenticateToken, authorizeUserType("admin"), listarUsuarios);

// Buscar usuário por ID - Apenas admin
router.get("/:id", authenticateToken, authorizeUserType("admin"), buscarUsuario);

// Cadastrar novo usuário
router.post("/", cadastrarUsuario);

// Atualizar usuário
router.put("/:id", authenticateToken, atualizarUsuario);

// Deletar usuário - Apenas admin
router.delete("/:id", authenticateToken, authorizeUserType("admin"), deletarUsuario);

module.exports = router;