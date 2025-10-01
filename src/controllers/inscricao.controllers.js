const { Inscricao, Evento, User, Participante, TipoVaga } = require("../models");
const { Op } = require('sequelize');
const { verificarCamposObrigatoriosInscricao, validarPrecoFinal, validarStatusInscricao } = require("../validators/inscricao.validators");

// Buscar inscrição por ID
const buscarInscricao = async (req, res) => {
    try {
        const id = req.params.id;
        const user_id = req.user.id;
        const isAdmin = req.user.tipoUsuario === 'admin';
        
        const inscricao = await Inscricao.findByPk(id, {
            include: [
                { model: Evento, as: 'evento' },
                { model: User, as: 'user' },
                { model: Participante, as: 'participante' },
                { model: TipoVaga, as: 'tipoVaga' }
            ]
        });

        if (inscricao === null) {
            res.status(404).json({aviso: "Inscrição não encontrada!"});
            return;
        }
        
        // Verificar permissão - apenas admins ou o próprio usuário pode ver sua inscrição
        if (!isAdmin && inscricao.user_id !== user_id) {
            res.status(403).json({aviso: "Você não tem permissão para acessar essa inscrição!"});
            return;
        }

        const resposta = {
            aviso: "Inscrição encontrada!",
            inscricao: inscricao
        };

        res.status(200).json(resposta);
    } catch (error) {
        res.status(500).send("Erro interno ao buscar inscrição");
        console.error("Erro ao buscar inscrição:", error);
    }
};

// Listar todas as inscrições com filtros opcionais
// Esta função só deve ser acessada por admins (proteção já configurada na rota)
const listarInscricoes = async (req, res) => {
    try {
        const { evento_id, user_id, participante_id, status_inscricao, page = 1, limit = 10 } = req.query;
        
        const where = {};
        
        if (evento_id) where.evento_id = evento_id;
        if (user_id) where.user_id = user_id;
        if (participante_id) where.participante_id = participante_id;
        if (status_inscricao) where.status_inscricao = status_inscricao;

        const offset = (page - 1) * limit;

        const { count, rows: inscricoes } = await Inscricao.findAndCountAll({
            where,
            include: [
                { model: Evento, as: 'evento' },
                { model: User, as: 'user' },
                { model: Participante, as: 'participante' },
                { model: TipoVaga, as: 'tipoVaga' }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const resposta = {
            aviso: "Inscrições listadas com sucesso!",
            inscricoes: inscricoes,
            paginacao: {
                total: count,
                pagina_atual: parseInt(page),
                total_paginas: Math.ceil(count / limit),
                itens_por_pagina: parseInt(limit)
            }
        };

        res.status(200).json(resposta);
    } catch (error) {
        res.status(500).send("Erro interno ao listar inscrições");
        console.error("Erro ao listar inscrições:", error);
    }
};

// Cadastrar nova inscrição
const cadastrarInscricao = async (req, res) => {
    try {
        const { evento_id, participante_id, tipo_vaga_id, preco_inicial, desconto_autorizado, preco_final } = req.body;
        const user_id = req.user["id"];
        const dadosInscricao = { ...req.body };

        // Verificar campos obrigatórios usando o validador
        const errosCamposObrigatorios = verificarCamposObrigatoriosInscricao(dadosInscricao);
        if (errosCamposObrigatorios.length > 0) {
            res.status(422).json({
                aviso: errosCamposObrigatorios.join(" ")
            });
            return;
        }
        
        // Os preços já foram calculados pelo middleware calcularPrecos
        // Validamos apenas se o preço final está presente
        if (preco_final === undefined || preco_inicial === undefined) {
            res.status(422).json({
                aviso: "Erro no cálculo dos preços. Por favor, tente novamente."
            });
            return;
        }

        // Verificar se o evento existe
        const evento = await Evento.findByPk(evento_id);
        if (!evento) {
            res.status(404).json({aviso: "Evento não encontrado!"});
            return;
        }

        // Verificar se é admin do sistema
        const isAdmin = req.user.tipoUsuario === 'admin';
        
        // Verificar se é admin do evento
        let isEventoAdministrador = false;
        if (!isAdmin) {
            const EventoAdministrador = require('../models/eventoAdministrador.models');
            const adminEvento = await EventoAdministrador.findOne({
                where: {
                    user_id: user_id,
                    evento_id: evento_id
                }
            });
            isEventoAdministrador = !!adminEvento;
        }

        // Verificar se o participante existe
        let participante;
        if (isAdmin || isEventoAdministrador) {
            // Admins podem cadastrar inscrições para qualquer participante
            participante = await Participante.findByPk(participante_id);
            if (!participante) {
                res.status(404).json({aviso: "Participante não encontrado!"});
                return;
            }
        } else {
            // Usuários normais só podem cadastrar para seus próprios participantes
            participante = await Participante.findOne({
                where: { id: participante_id, user_id: user_id }
            });
            if (!participante) {
                res.status(404).json({aviso: "Participante não encontrado ou não pertence ao usuário!"});
                return;
            }
        }

        // Verificar se o tipo de vaga existe e pertence ao evento
        const tipoVaga = await TipoVaga.findOne({
            where: { id: tipo_vaga_id, evento_id: evento_id }
        });
        if (!tipoVaga) {
            res.status(404).json({aviso: "Tipo de vaga não encontrado para este evento!"});
            return;
        }

        // Verificar se já existe inscrição para este participante no evento
        const inscricaoExistente = await Inscricao.findOne({
            where: { evento_id: evento_id, participante_id: participante_id }
        });
        if (inscricaoExistente) {
            res.status(409).json({aviso: "Participante já está inscrito neste evento!"});
            return;
        }

        // Verificar se há vagas disponíveis
        const inscricoesExistentes = await Inscricao.count({
            where: { 
                tipo_vaga_id: tipo_vaga_id,
                status_inscricao: { [Op.in]: ['Pendente', 'Pago'] }
            }
        });

        if (inscricoesExistentes >= tipoVaga.total_vagas) {
            res.status(409).json({aviso: "Não há vagas disponíveis para este tipo!"});
            return;
        }

        // Criar a inscrição
        // Se for admin cadastrando para outro usuário, use o user_id do participante
        const inscricao_user_id = (isAdmin || isEventoAdministrador) ? participante.user_id : user_id;
        
        const novaInscricao = await Inscricao.create({
            evento_id,
            user_id: inscricao_user_id, // Usar o ID do usuário do participante se for admin
            participante_id,
            tipo_vaga_id,
            preco_inicial,
            desconto_autorizado,
            preco_final,
            status_inscricao: 'Pendente'
        });

        const inscricaoCompleta = await Inscricao.findByPk(novaInscricao.id, {
            include: [
                { model: Evento, as: 'evento' },
                { model: User, as: 'user' },
                { model: Participante, as: 'participante' },
                { model: TipoVaga, as: 'tipoVaga' }
            ]
        });

        const resposta = {
            aviso: "Inscrição cadastrada com sucesso!",
            inscricao: inscricaoCompleta
        };

        res.status(201).json(resposta);
    } catch (error) {
        res.status(500).send("Erro interno ao cadastrar inscrição");
        console.error("Erro ao cadastrar inscrição:", error);
    }
};

// Atualizar inscrição
const atualizarInscricao = async (req, res) => {
    try {
        const id = req.params.id;
        const { tipo_vaga_id, preco_final, preco_inicial, desconto_autorizado, status_inscricao } = req.body;
        const user_id = req.user["id"];
        const isAdmin = req.user.tipoUsuario === 'admin';

        // Buscar a inscrição
        const inscricao = await Inscricao.findByPk(id);
        if (!inscricao) {
            res.status(404).json({aviso: "Inscrição não encontrada!"});
            return;
        }

        // Verificar se o usuário tem permissão para editar esta inscrição
        // Admins do sistema podem editar qualquer inscrição
        if (inscricao.user_id !== user_id && !isAdmin) {
            // Verificar se é admin do evento
            const EventoAdministrador = require('../models/eventoAdministrador.models');
            const adminEvento = await EventoAdministrador.findOne({
                where: {
                    user_id: user_id,
                    evento_id: inscricao.evento_id
                }
            });
            
            // Se não for admin do sistema nem admin do evento, bloquear acesso
            if (!adminEvento) {
                res.status(403).json({aviso: "Você não tem permissão para editar esta inscrição!"});
                return;
            }
        }

        const dadosAtualizacao = {};

        // Validar e atualizar tipo_vaga_id se fornecido
        if (tipo_vaga_id) {
            const tipoVaga = await TipoVaga.findOne({
                where: { id: tipo_vaga_id, evento_id: inscricao.evento_id }
            });
            if (!tipoVaga) {
                res.status(404).json({aviso: "Tipo de vaga não encontrado para este evento!"});
                return;
            }
            dadosAtualizacao.tipo_vaga_id = tipo_vaga_id;
        }

        // Verificar se é admin do evento
        let isEventoAdministrador = false;
        
        if (!isAdmin) {
            const EventoAdministrador = require('../models/eventoAdministrador.models');
            const adminEvento = await EventoAdministrador.findOne({
                where: {
                    user_id: user_id,
                    evento_id: inscricao.evento_id
                }
            });
            isEventoAdministrador = !!adminEvento;
        }
        
        // Atualizar preços apenas se for admin do sistema ou admin do evento
        if (isAdmin || isEventoAdministrador) {
            // Se estamos alterando o tipo_vaga_id ou aplicando um desconto_admin,
            // o middleware calcularPrecos já terá recalculado os preços
            // e atualizado req.body com os novos valores
            
            // Atualizar preço inicial
            if (preco_inicial !== undefined) {
                const validacaoPreco = validarPrecoFinal(preco_inicial);
                if (!validacaoPreco.valido) {
                    res.status(422).json({aviso: "Preço inicial: " + validacaoPreco.msg});
                    return;
                }
                dadosAtualizacao.preco_inicial = preco_inicial;
            }
            
            // Atualizar desconto autorizado
            if (desconto_autorizado !== undefined) {
                const validacaoDesconto = validarPrecoFinal(desconto_autorizado);
                if (!validacaoDesconto.valido) {
                    res.status(422).json({aviso: "Desconto: " + validacaoDesconto.msg});
                    return;
                }
                dadosAtualizacao.desconto_autorizado = desconto_autorizado;
            }
            
            // Atualizar preço final
            if (preco_final !== undefined) {
                const validacaoPreco = validarPrecoFinal(preco_final);
                if (!validacaoPreco.valido) {
                    res.status(422).json({aviso: "Preço final: " + validacaoPreco.msg});
                    return;
                }
                dadosAtualizacao.preco_final = preco_final;
            }
        } else if (preco_final !== undefined || preco_inicial !== undefined || desconto_autorizado !== undefined) {
            // Se não for admin e tentar alterar os preços, negar
            res.status(403).json({aviso: "Você não tem permissão para alterar os valores da inscrição!"});
            return;
        }

        // Atualizar status se fornecido
        if (status_inscricao) {
            const validacaoStatus = validarStatusInscricao(status_inscricao);
            if (!validacaoStatus.valido) {
                res.status(422).json({aviso: validacaoStatus.msg});
                return;
            }
            dadosAtualizacao.status_inscricao = status_inscricao;
        }

        // Atualizar a inscrição
        await inscricao.update(dadosAtualizacao);

        // Buscar a inscrição atualizada com includes
        const inscricaoAtualizada = await Inscricao.findByPk(id, {
            include: [
                { model: Evento, as: 'evento' },
                { model: User, as: 'user' },
                { model: Participante, as: 'participante' },
                { model: TipoVaga, as: 'tipoVaga' }
            ]
        });

        const resposta = {
            aviso: "Inscrição atualizada com sucesso!",
            inscricao: inscricaoAtualizada
        };

        res.status(200).json(resposta);
    } catch (error) {
        res.status(500).send("Erro interno ao atualizar inscrição");
        console.error("Erro ao atualizar inscrição:", error);
    }
};

// Cancelar inscrição (soft delete - apenas muda status)
const cancelarInscricao = async (req, res) => {
    try {
        const id = req.params.id;
        const user_id = req.user["id"];

        // Buscar a inscrição
        const inscricao = await Inscricao.findByPk(id);
        if (!inscricao) {
            res.status(404).json({aviso: "Inscrição não encontrada!"});
            return;
        }

        // Verificar se o usuário tem permissão para cancelar esta inscrição
        const isAdmin = req.user.tipoUsuario === 'admin';
        
        // Admins do sistema podem cancelar qualquer inscrição
        if (inscricao.user_id !== user_id && !isAdmin) {
            // Verificar se é admin do evento
            const EventoAdministrador = require('../models/eventoAdministrador.models');
            const adminEvento = await EventoAdministrador.findOne({
                where: {
                    user_id: user_id,
                    evento_id: inscricao.evento_id
                }
            });
            
            // Se não for admin do sistema nem admin do evento, bloquear acesso
            if (!adminEvento) {
                res.status(403).json({aviso: "Você não tem permissão para cancelar esta inscrição!"});
                return;
            }
        }

        // Verificar se a inscrição já está cancelada
        if (inscricao.status_inscricao === 'Cancelado') {
            res.status(409).json({aviso: "Inscrição já está cancelada!"});
            return;
        }

        // Cancelar a inscrição
        await inscricao.update({ status_inscricao: 'Cancelado' });

        const resposta = {
            aviso: "Inscrição cancelada com sucesso!",
            inscricao: inscricao
        };

        res.status(200).json(resposta);
    } catch (error) {
        res.status(500).send("Erro interno ao cancelar inscrição");
        console.error("Erro ao cancelar inscrição:", error);
    }
};

// Deletar inscrição (hard delete)
const deletarInscricao = async (req, res) => {
    try {
        const id = req.params.id;
        const user_id = req.user["id"];

        // Buscar a inscrição
        const inscricao = await Inscricao.findByPk(id);
        if (!inscricao) {
            res.status(404).json({aviso: "Inscrição não encontrada!"});
            return;
        }

        // Verificar se o usuário tem permissão para deletar esta inscrição
        // Esta verificação é redundante pois a rota já está protegida por authorizeUserType("admin"),
        // mas mantemos para garantir a segurança mesmo se a configuração da rota mudar
        const isAdmin = req.user.tipoUsuario === 'admin';
        if (!isAdmin) {
            res.status(403).json({aviso: "Apenas administradores do sistema podem deletar inscrições!"});
            return;
        }

        // Deletar a inscrição
        await inscricao.destroy();

        const resposta = {
            aviso: "Inscrição deletada com sucesso!"
        };

        res.status(200).json(resposta);
    } catch (error) {
        res.status(500).send("Erro interno ao deletar inscrição");
        console.error("Erro ao deletar inscrição:", error);
    }
};

// Buscar inscrições por evento
// Esta função só deve ser acessada por admins do sistema ou admins do evento específico
// (proteção já configurada na rota com o middleware isEventoAdmin)
const buscarInscricoesPorEvento = async (req, res) => {
    try {
        const evento_id = req.params.evento_id;
        const { status_inscricao, page = 1, limit = 10 } = req.query;

        const where = { evento_id };
        if (status_inscricao) where.status_inscricao = status_inscricao;

        const offset = (page - 1) * limit;

        const { count, rows: inscricoes } = await Inscricao.findAndCountAll({
            where,
            include: [
                { model: Evento, as: 'evento' },
                { model: User, as: 'user' },
                { model: Participante, as: 'participante' },
                { model: TipoVaga, as: 'tipoVaga' }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const resposta = {
            aviso: "Inscrições do evento listadas com sucesso!",
            inscricoes: inscricoes,
            paginacao: {
                total: count,
                pagina_atual: parseInt(page),
                total_paginas: Math.ceil(count / limit),
                itens_por_pagina: parseInt(limit)
            }
        };

        res.status(200).json(resposta);
    } catch (error) {
        res.status(500).send("Erro interno ao buscar inscrições do evento");
        console.error("Erro ao buscar inscrições do evento:", error);
    }
};

// Buscar inscrições do usuário logado
const minhasInscricoes = async (req, res) => {
    try {
        const user_id = req.user["id"];
        const { status_inscricao, page = 1, limit = 10 } = req.query;

        const where = { user_id };
        if (status_inscricao) where.status_inscricao = status_inscricao;

        const offset = (page - 1) * limit;

        const { count, rows: inscricoes } = await Inscricao.findAndCountAll({
            where,
            include: [
                { model: Evento, as: 'evento' },
                { model: User, as: 'user' },
                { model: Participante, as: 'participante' },
                { model: TipoVaga, as: 'tipoVaga' }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const resposta = {
            aviso: "Suas inscrições listadas com sucesso!",
            inscricoes: inscricoes,
            paginacao: {
                total: count,
                pagina_atual: parseInt(page),
                total_paginas: Math.ceil(count / limit),
                itens_por_pagina: parseInt(limit)
            }
        };

        res.status(200).json(resposta);
    } catch (error) {
        res.status(500).send("Erro interno ao buscar suas inscrições");
        console.error("Erro ao buscar suas inscrições:", error);
    }
};

module.exports = {
    buscarInscricao,
    listarInscricoes,
    cadastrarInscricao,
    atualizarInscricao,
    cancelarInscricao,
    deletarInscricao,
    buscarInscricoesPorEvento,
    minhasInscricoes
};
