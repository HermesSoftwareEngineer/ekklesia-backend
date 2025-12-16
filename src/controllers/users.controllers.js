const User = require("../models/users.models");
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { validarEConverterData } = require('../validators/users.validators');

// Função para listar todos os usuários com filtros opcionais
const listarUsuarios = async (req, res) => {
    try {
        // Filtros possíveis: nome, email, tipoUsuario, ativo, cidade, uf
        const { nome, email, tipoUsuario, ativo, cidade, uf } = req.query;

        // Monta objeto de filtros dinamicamente
        const where = {};
        
        if (nome) where.nome = { [Op.iLike]: `%${nome}%` };
        if (email) where.email = { [Op.like]: `%${email}%` };
        if (tipoUsuario) {
            // Validação do tipoUsuario
            if (!['user', 'admin'].includes(tipoUsuario)) {
                return res.status(400).json({
                    aviso: "Valor inválido para tipoUsuario. Deve ser 'user' ou 'admin'."
                });
            }
            where.tipoUsuario = tipoUsuario;
        }
        if (ativo !== undefined) where.ativo = ativo === 'true';
        if (cidade) where.cidade = { [Op.iLike]: `%${cidade}%` };
        if (uf) where.uf = uf;

        // Não retorna o campo senhaHash nas consultas
        const usuarios = await User.findAll({
            where,
            attributes: { exclude: ['senhaHash'] }
        });

        res.status(200).json({
            aviso: "Usuários encontrados!",
            usuarios: usuarios
        });
    } catch (error) {
        res.status(500).send("Erro interno ao listar usuários.");
        console.error("Erro ao listar usuários:", error);
    }
};

// Função para buscar um usuário pelo ID
const buscarUsuario = async (req, res) => {
    try {
        const id = req.params.id;
        
        const usuario = await User.findByPk(id, {
            attributes: { exclude: ['senhaHash'] } // Exclui a senha do resultado
        });

        if (usuario === null) {
            res.status(404).json({aviso: "Usuário não encontrado!"});
            return;
        }
        
        const resposta = {
            aviso: "Usuário encontrado!",
            usuario: usuario
        };

        res.status(200).json(resposta);
    } catch (error) {
        res.status(500).send("Erro interno ao buscar usuário");
        console.error("Erro ao buscar usuário:", error);
    }
};

// Função para cadastrar um novo usuário
const cadastrarUsuario = async (req, res) => {
    try {
        // Organizar dados da requisição
        const { nome, email, senha, telefone, dataNascimento, tipoUsuario, cidade, uf } = req.body;

        // Verificar campos obrigatórios
        if (!nome || !email || !senha) {
            res.status(422).json({aviso: "Nome, email e senha são campos obrigatórios!"});
            return;
        }

        // Verificar se já existe um usuário com esse email
        const usuarioExistente = await User.findOne({ where: { email } });
        if (usuarioExistente) {
            res.status(409).json({aviso: "Já existe um usuário com este email!"});
            return;
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // Validar e formatar data de nascimento se fornecida
        let dataFormatada = null;
        if (dataNascimento) {
            const validacao = validarEConverterData(dataNascimento);
            if (!validacao.valido) {
                return res.status(400).json({ aviso: validacao.msg });
            }
            dataFormatada = validacao.dataConvertida;
        }

        // Criar o usuário
        const usuario = await User.create({
            nome,
            email,
            senhaHash,
            telefone,
            dataNascimento: dataFormatada,
            tipoUsuario: tipoUsuario || "user",
            cidade,
            uf
        });

        // Retornar usuário sem a senha
        const usuarioSemSenha = {
            ...usuario.get(),
            senhaHash: undefined
        };

        res.status(201).json({
            aviso: "Usuário cadastrado com sucesso!",
            usuario: usuarioSemSenha
        });

    } catch (error) {
        res.status(500).send("Erro interno ao cadastrar usuário.");
        console.error("Erro ao cadastrar usuário:", error);
    }
};

// Função para atualizar dados do usuário
const atualizarUsuario = async (req, res) => {
    try {
        const id = req.params.id;
        const { nome, email, senha, telefone, dataNascimento, tipoUsuario, ativo, cidade, uf } = req.body;
        
        // Verificar permissões - apenas o próprio usuário ou admin podem atualizar
        const usuarioLogado = req.user;
        const isAdmin = usuarioLogado?.tipoUsuario === 'admin';
        const isOwnUser = usuarioLogado?.id === parseInt(id);
        
        if (!isAdmin && !isOwnUser) {
            return res.status(403).json({
                aviso: "Permissão negada! Você só pode atualizar seus próprios dados."
            });
        }

        // Verificar se o usuário existe
        const usuario = await User.findByPk(id);
        if (!usuario) {
            res.status(404).json({aviso: "Usuário não encontrado!"});
            return;
        }

        // Verificar se está tentando atualizar para um email já existente
        if (email && email !== usuario.email) {
            const emailExistente = await User.findOne({ where: { email } });
            if (emailExistente) {
                res.status(409).json({aviso: "Este email já está sendo usado por outro usuário!"});
                return;
            }
        }

        // Processar a senha se ela foi fornecida
        let senhaAtualizada;
        if (senha) {
            const salt = await bcrypt.genSalt(10);
            senhaAtualizada = await bcrypt.hash(senha, salt);
        }

        // Validar e formatar data de nascimento se fornecida
        let dataFormatada = undefined;
        if (dataNascimento) {
            const validacao = validarEConverterData(dataNascimento);
            if (!validacao.valido) {
                return res.status(400).json({ aviso: validacao.msg });
            }
            dataFormatada = validacao.dataConvertida;
        }
        
        // Apenas admin pode alterar o tipo de usuário
        if (tipoUsuario !== undefined && !isAdmin) {
            return res.status(403).json({
                aviso: "Permissão negada! Apenas administradores podem alterar o tipo de usuário."
            });
        }
        
        // Apenas admin pode alterar o status de ativo/inativo
        if (ativo !== undefined && !isAdmin) {
            return res.status(403).json({
                aviso: "Permissão negada! Apenas administradores podem ativar/desativar usuários."
            });
        }

        // Validação do tipoUsuario
        if (![undefined, 'user', 'admin'].includes(tipoUsuario)) {
            return res.status(400).json({
                aviso: "Valor inválido para tipoUsuario. Deve ser 'user' ou 'admin'."
            });
        }

        // Atualizar os dados do usuário
        await usuario.update({
            nome: nome !== undefined ? nome : usuario.nome,
            email: email !== undefined ? email : usuario.email,
            senhaHash: senhaAtualizada || usuario.senhaHash,
            telefone: telefone !== undefined ? telefone : usuario.telefone,
            dataNascimento: dataFormatada !== undefined ? dataFormatada : usuario.dataNascimento,
            tipoUsuario: tipoUsuario !== undefined ? tipoUsuario : usuario.tipoUsuario,
            ativo: ativo !== undefined ? ativo : usuario.ativo,
            cidade: cidade !== undefined ? cidade : usuario.cidade,
            uf: uf !== undefined ? uf : usuario.uf
        });

        // Retornar o usuário atualizado sem a senha
        const usuarioAtualizado = await User.findByPk(id, {
            attributes: { exclude: ['senhaHash'] }
        });

        res.status(200).json({
            aviso: "Usuário atualizado com sucesso!",
            usuario: usuarioAtualizado
        });

    } catch (error) {
        res.status(500).send("Erro interno ao atualizar usuário.");
        console.error("Erro ao atualizar usuário:", error);
    }
};

// Função para deletar um usuário
const deletarUsuario = async (req, res) => {
    try {
        const id = req.params.id;

        // Verificar se o usuário existe
        const usuario = await User.findByPk(id);
        if (!usuario) {
            res.status(404).json({aviso: "Usuário não encontrado!"});
            return;
        }

        // Deletar o usuário
        await usuario.destroy();

        res.status(200).json({
            aviso: "Usuário deletado com sucesso!"
        });

    } catch (error) {
        res.status(500).send("Erro interno ao deletar usuário.");
        console.error("Erro ao deletar usuário:", error);
    }
};

module.exports = {
    listarUsuarios,
    buscarUsuario,
    cadastrarUsuario,
    atualizarUsuario,
    deletarUsuario
}