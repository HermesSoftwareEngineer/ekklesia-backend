const User = require("../models/users.models");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registerUser = async (req, res) => {
    try {

        const {nome, email, senha, telefone, dataNascimento, tipoUsuario, ativo, cidade, uf } = req.body;

        if (!nome || !email || !senha) {
            res.status(400).json({aviso: "Nome, e-mail e senha são obrigatórios!"});
            return;
        }

        const userSearch = await User.findAll({
            where: {
                email
            }
        });
    
        if (userSearch.length > 0) {
            res.status(409).json({aviso: "E-mail já cadastrado no sistema!", user: userSearch});
            return;
        };

        const saltRounds = 10
        const senhaHash = await bcrypt.hash(senha, saltRounds)

        const user = await User.create({
            nome,
            email,
            senhaHash,
            telefone,
            dataNascimento,
            tipoUsuario,
            ativo,
            cidade,
            uf
        })

        res.status(201).json({ 
            aviso: "Novo usuário criado!",
            user: user
        });
    } catch (error){
        console.error("Erro ao registrar usuário:", error);
        res.status(500).send("Erro ao registrar usuário!");
    }
}

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const user = await User.findAll({
            where: {
                email
            }
        });
    
        if (!(user.length > 0)) {
            res.status(404).json({aviso: "Cadastro não encontrado!"});
            return;
        };

        const senhaHash = user[0].dataValues.senhaHash;
        const validacaoSenha = await bcrypt.compare(senha, senhaHash);

        if (!validacaoSenha) {
            res.status(401).json({aviso: "Senha incorreta!"});
            return;
        };

        const token = await jwt.sign({id: user[0].dataValues.id, email: user[0].dataValues.email, tipoUsuario: user[0].dataValues.tipoUsuario}, process.env.JWT_KEY, {
            expiresIn: '1h'
        });

        res.status(200).json({aviso: "Login bem sucedido!", token: token})

    } catch (error) {
        console.error("Erro ao logar usuário:", error);
        res.status(500).send("Erro ao logar!");
    }
}

module.exports = { registerUser, login }