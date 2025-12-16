const TipoVaga = require('../models/tipoVaga.models');
const Evento = require('../models/evento.models');
const EventoAdministrador = require('../models/eventoAdministrador.models');
const { Op } = require('sequelize');
const {
    validarCamposObrigatoriosTipoVaga,
    validarValoresNumericosTipoVaga,
    validarDatasTipoVaga,
    converterFormatoData
} = require('../validators/tipoVaga.validators');

// Função para listar todos os tipos de vaga
const listarTiposVaga = async (req, res) => {
    try {
        // Parâmetros opcionais para filtros
        const { 
            evento_id, 
            nome_vaga, 
            preco_min, 
            preco_max, 
            disponivel
        } = req.query;

        // Objeto para construção da cláusula WHERE dinâmica
        const where = {};

        // Adiciona filtros se informados
        if (evento_id) where.evento_id = evento_id;
        if (nome_vaga) where.nome_vaga = { [Op.like]: `%${nome_vaga}%` };
        if (preco_min || preco_max) {
            where.preco = {};
            if (preco_min) where.preco[Op.gte] = parseFloat(preco_min);
            if (preco_max) where.preco[Op.lte] = parseFloat(preco_max);
        }
        if (disponivel === 'true') {
            where.quantidade_disponivel = { [Op.gt]: 0 };
        } else if (disponivel === 'false') {
            where.quantidade_disponivel = 0;
        }

        const tiposVaga = await TipoVaga.findAll({
            where,
            include: [
                {
                    model: Evento,
                    attributes: ['id', 'titulo', 'status']
                }
            ],
            order: [['evento_id', 'ASC'], ['nome_vaga', 'ASC']]
        });

        res.status(200).json({
            aviso: "Tipos de vaga encontrados!",
            tiposVaga: tiposVaga
        });
    } catch (error) {
        res.status(500).json({
            aviso: "Erro interno ao listar tipos de vaga.",
            erro: error.message
        });
        console.error("Erro ao listar tipos de vaga:", error);
    }
};

// Função para buscar um tipo de vaga pelo ID
const buscarTipoVaga = async (req, res) => {
    try {
        const id = req.params.id;
        
        const tipoVaga = await TipoVaga.findByPk(id, {
            include: [
                {
                    model: Evento,
                    attributes: ['id', 'titulo', 'status']
                }
            ]
        });

        if (!tipoVaga) {
            return res.status(404).json({aviso: "Tipo de vaga não encontrado!"});
        }
        
        res.status(200).json({
            aviso: "Tipo de vaga encontrado!",
            tipoVaga: tipoVaga
        });
    } catch (error) {
        res.status(500).json({
            aviso: "Erro interno ao buscar tipo de vaga.",
            erro: error.message
        });
        console.error("Erro ao buscar tipo de vaga:", error);
    }
};

// Função para cadastrar um novo tipo de vaga
const criarTipoVaga = async (req, res) => {
    try {
        // Extrai dados do body
        const {
            evento_id,
            nome_vaga,
            descricao,
            preco,
            quantidade_total,
            data_inicio,
            data_fim
        } = req.body;

        // Validação de campos obrigatórios
        const camposObrigatorios = [
            'evento_id', 'nome_vaga', 'descricao', 'preco', 
            'quantidade_total'
        ];
        
        const errosCampos = validarCamposObrigatoriosTipoVaga(req.body, camposObrigatorios);
        if (errosCampos.length > 0) {
            return res.status(400).json({
                aviso: "Campos obrigatórios não preenchidos!",
                erros: errosCampos
            });
        }

        // Verifica se o evento existe
        const evento = await Evento.findByPk(evento_id);
        if (!evento) {
            return res.status(404).json({aviso: "Evento não encontrado!"});
        }
        
        // Verifica se o usuário tem permissão para criar tipos de vaga neste evento
        // Administradores do sistema podem criar tipos de vaga em qualquer evento
        if (req.user.tipoUsuario !== 'admin') {
            // Verifica se o usuário é administrador do evento
            const isAdmin = await EventoAdministrador.findOne({
                where: {
                    user_id: req.user.id,
                    evento_id: evento_id
                }
            });

            if (!isAdmin) {
                return res.status(403).json({
                    aviso: "Você não tem permissão para criar tipos de vaga neste evento"
                });
            }
        }
        
        // Validação de valores numéricos
        const errosValores = validarValoresNumericosTipoVaga(req.body);
        if (errosValores.length > 0) {
            return res.status(400).json({
                aviso: "Valores inválidos!",
                erros: errosValores
            });
        }
        
        // Validação de datas e seus formatos
        const errosDatas = validarDatasTipoVaga(req.body);
        if (errosDatas.length > 0) {
            return res.status(400).json({
                aviso: "Datas inválidas!",
                erros: errosDatas
            });
        }
        
        // Converter datas do formato dd/mm/aaaa para yyyy-mm-dd
        const dataInicioFormatada = data_inicio ? converterFormatoData(data_inicio) : null;
        const dataFimFormatada = data_fim ? converterFormatoData(data_fim) : null;

        // Define quantidade_disponivel igual a quantidade_total no cadastro
        const quantidade_disponivel = quantidade_total;

        // Cria o tipo de vaga
        const tipoVaga = await TipoVaga.create({
            evento_id,
            nome_vaga,
            descricao,
            preco,
            quantidade_total,
            quantidade_disponivel,
            data_inicio: dataInicioFormatada,
            data_fim: dataFimFormatada
        });

        res.status(201).json({
            aviso: "Tipo de vaga criado com sucesso!",
            tipoVaga: tipoVaga
        });
    } catch (error) {
        res.status(500).json({
            aviso: "Erro interno ao criar tipo de vaga.",
            erro: error.message
        });
        console.error("Erro ao criar tipo de vaga:", error);
    }
};

// Função para atualizar um tipo de vaga
const atualizarTipoVaga = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Extrai dados do body
        const {
            nome_vaga,
            descricao,
            preco,
            quantidade_total,
            quantidade_disponivel,
            data_inicio,
            data_fim
        } = req.body;

        // Verificar se o tipo de vaga existe
        const tipoVaga = await TipoVaga.findByPk(id);
        if (!tipoVaga) {
            return res.status(404).json({aviso: "Tipo de vaga não encontrado!"});
        }

        // Prepara os dados para validação
        const dadosParaValidar = {
            ...req.body,
            quantidade_total: quantidade_total !== undefined ? quantidade_total : tipoVaga.quantidade_total,
            quantidade_disponivel: quantidade_disponivel !== undefined ? quantidade_disponivel : tipoVaga.quantidade_disponivel
        };
        
        // Validação de valores numéricos
        const errosValores = validarValoresNumericosTipoVaga(dadosParaValidar);
        if (errosValores.length > 0) {
            return res.status(400).json({
                aviso: "Valores inválidos!",
                erros: errosValores
            });
        }
        
        // Validação de datas e seus formatos
        const errosDatas = validarDatasTipoVaga(dadosParaValidar);
        if (errosDatas.length > 0) {
            return res.status(400).json({
                aviso: "Datas inválidas!",
                erros: errosDatas
            });
        }
        
        // Converter datas do formato dd/mm/aaaa para yyyy-mm-dd se estiverem presentes
        const dataInicioFormatada = data_inicio ? converterFormatoData(data_inicio) : undefined;
        const dataFimFormatada = data_fim ? converterFormatoData(data_fim) : undefined;

        // Atualiza os dados do tipo de vaga
        await tipoVaga.update({
            nome_vaga: nome_vaga || tipoVaga.nome_vaga,
            descricao: descricao || tipoVaga.descricao,
            preco: preco !== undefined ? preco : tipoVaga.preco,
            quantidade_total: quantidade_total !== undefined ? quantidade_total : tipoVaga.quantidade_total,
            quantidade_disponivel: quantidade_disponivel !== undefined ? quantidade_disponivel : tipoVaga.quantidade_disponivel,
            data_inicio: dataInicioFormatada !== undefined ? dataInicioFormatada : tipoVaga.data_inicio,
            data_fim: dataFimFormatada !== undefined ? dataFimFormatada : tipoVaga.data_fim
        });

        const tipoVagaAtualizado = await TipoVaga.findByPk(id, {
            include: [
                {
                    model: Evento,
                    attributes: ['id', 'titulo', 'status']
                }
            ]
        });

        res.status(200).json({
            aviso: "Tipo de vaga atualizado com sucesso!",
            tipoVaga: tipoVagaAtualizado
        });

    } catch (error) {
        res.status(500).json({
            aviso: "Erro interno ao atualizar tipo de vaga.",
            erro: error.message
        });
        console.error("Erro ao atualizar tipo de vaga:", error);
    }
};

// Função para deletar um tipo de vaga
const deletarTipoVaga = async (req, res) => {
    try {
        const id = req.params.id;

        // Verificar se o tipo de vaga existe
        const tipoVaga = await TipoVaga.findByPk(id);
        if (!tipoVaga) {
            return res.status(404).json({aviso: "Tipo de vaga não encontrado!"});
        }

        // Deletar o tipo de vaga
        await tipoVaga.destroy();

        res.status(200).json({
            aviso: "Tipo de vaga deletado com sucesso!"
        });

    } catch (error) {
        res.status(500).json({
            aviso: "Erro interno ao deletar tipo de vaga.",
            erro: error.message
        });
        console.error("Erro ao deletar tipo de vaga:", error);
    }
};

module.exports = {
    listarTiposVaga,
    buscarTipoVaga,
    criarTipoVaga,
    atualizarTipoVaga,
    deletarTipoVaga
};