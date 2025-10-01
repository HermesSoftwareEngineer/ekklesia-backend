const EventoAdministrador = require('../models/eventoAdministrador.models');
const User = require('../models/users.models');
const Evento = require('../models/evento.models');
const { Op } = require('sequelize');

// Função para listar administradores de um evento
const listarAdministradoresEvento = async (req, res) => {
    try {
        const evento_id = req.params.evento_id;

        // Verifica se o evento existe
        const evento = await Evento.findByPk(evento_id);
        if (!evento) {
            return res.status(404).json({ aviso: "Evento não encontrado!" });
        }

        // Busca administradores do evento usando a relação já estabelecida
        const eventoComAdmins = await Evento.findByPk(evento_id, {
            include: [
                {
                    model: User,
                    as: 'administradores',
                    attributes: ['id', 'nome', 'email', 'telefone'],
                    through: { attributes: [] } // Não incluir atributos da tabela de junção
                }
            ]
        });

        res.status(200).json({
            aviso: "Administradores encontrados!",
            administradores: eventoComAdmins?.administradores || []
        });
    } catch (error) {
        res.status(500).json({
            aviso: "Erro interno ao listar administradores do evento.",
            erro: error.message
        });
        console.error("Erro ao listar administradores do evento:", error);
    }
};

// Função para adicionar um administrador a um evento
const adicionarAdministradorEvento = async (req, res) => {
    try {
        const { evento_id, user_id } = req.body;

        // Validações básicas
        if (!evento_id || !user_id) {
            return res.status(400).json({ aviso: "IDs do evento e do usuário são obrigatórios!" });
        }

        // Verifica se o evento existe
        const evento = await Evento.findByPk(evento_id);
        if (!evento) {
            return res.status(404).json({ aviso: "Evento não encontrado!" });
        }

        // Verifica se o usuário existe
        const usuario = await User.findByPk(user_id);
        if (!usuario) {
            return res.status(404).json({ aviso: "Usuário não encontrado!" });
        }

        // Verifica se já existe este administrador para o evento
        const adminExistente = await EventoAdministrador.findOne({
            where: { evento_id, user_id }
        });

        if (adminExistente) {
            return res.status(409).json({ aviso: "Este usuário já é administrador deste evento!" });
        }

        // Adiciona o usuário como administrador
        await EventoAdministrador.create({
            evento_id,
            user_id
        });

        res.status(201).json({
            aviso: "Administrador adicionado com sucesso!",
            evento_id,
            user_id
        });
    } catch (error) {
        res.status(500).json({
            aviso: "Erro interno ao adicionar administrador ao evento.",
            erro: error.message
        });
        console.error("Erro ao adicionar administrador ao evento:", error);
    }
};

// Função para remover um administrador de um evento
const removerAdministradorEvento = async (req, res) => {
    try {
        const { evento_id, user_id } = req.params;

        // Validações básicas
        if (!evento_id || !user_id) {
            return res.status(400).json({ aviso: "IDs do evento e do usuário são obrigatórios!" });
        }

        // Verifica se existe este administrador para o evento
        const admin = await EventoAdministrador.findOne({
            where: { evento_id, user_id }
        });

        if (!admin) {
            return res.status(404).json({ aviso: "Este usuário não é administrador deste evento!" });
        }

        // Remove o usuário como administrador
        await admin.destroy();

        res.status(200).json({
            aviso: "Administrador removido com sucesso!"
        });
    } catch (error) {
        res.status(500).json({
            aviso: "Erro interno ao remover administrador do evento.",
            erro: error.message
        });
        console.error("Erro ao remover administrador do evento:", error);
    }
};

// Função para listar eventos administrados por um usuário
const listarEventosAdministrados = async (req, res) => {
    try {
        const user_id = req.params.user_id || req.user.id;

        // Verifica se o usuário existe
        const usuario = await User.findByPk(user_id);
        if (!usuario) {
            return res.status(404).json({ aviso: "Usuário não encontrado!" });
        }

        // Busca eventos administrados pelo usuário usando a relação já estabelecida
        const usuarioComEventos = await User.findByPk(user_id, {
            include: [
                {
                    model: Evento,
                    as: 'eventosAdministrados',
                    attributes: ['id', 'titulo', 'data_inicio', 'data_fim', 'status'],
                    through: { attributes: [] } // Não incluir atributos da tabela de junção
                }
            ]
        });

        res.status(200).json({
            aviso: "Eventos administrados encontrados!",
            eventos: usuarioComEventos?.eventosAdministrados || []
        });
    } catch (error) {
        res.status(500).json({
            aviso: "Erro interno ao listar eventos administrados.",
            erro: error.message
        });
        console.error("Erro ao listar eventos administrados:", error);
    }
};

module.exports = {
    listarAdministradoresEvento,
    adicionarAdministradorEvento,
    removerAdministradorEvento,
    listarEventosAdministrados
};