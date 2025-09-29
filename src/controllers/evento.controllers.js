const Evento = require('../models/evento.models');
const { Op } = require('sequelize');
const {
    validarDatasEvento,
    validarCamposObrigatoriosEvento,
    validarStatusEvento,
    validarCapacidade,
    validarDataEvento
} = require('../validators/evento.validators');

// Controller para cadastrar um novo evento
const criarEvento = async (req, res) => {
    try {

        const {
            titulo,
            percentual_desconto,
            frase_destaque,
            descricao,
            data_inicio,
            data_fim,
            horario_inicio,
            horario_fim,
            prazo_inscricao,
            abertura_inscricao,
            nome_local,
            endereco,
            cidade_uf_id,
            capacidade_total,
            categoria_evento,
            tema_central,
            status,
            link_lp,
            created_at,
            updated_at
        } = req.body;

        // Validação de campos obrigatórios
        const camposObrigatorios = [
            'titulo', 'data_inicio', 'data_fim', 'horario_inicio', 'horario_fim',
            'prazo_inscricao', 'abertura_inscricao', 'nome_local', 'endereco',
            'cidade_uf_id', 'capacidade_total', 'categoria_evento', 'tema_central', 'status'
        ];
        const errosCampos = validarCamposObrigatoriosEvento(req.body, camposObrigatorios);
        if (errosCampos.length > 0) {
            return res.status(400).json({ erros: errosCampos });
        }

        // Validação individual de cada data
        const datasParaValidar = {
            data_inicio,
            data_fim,
            prazo_inscricao,
            abertura_inscricao
        };
        for (const [campo, valor] of Object.entries(datasParaValidar)) {
            const validacao = validarDataEvento(valor);
            if (!validacao.valido) {
                return res.status(400).json({ erro: `Campo ${campo}: ${validacao.msg}` });
            }
        };

        // Validação de datas
        const validacaoDatas = validarDatasEvento({ data_inicio, data_fim, prazo_inscricao, abertura_inscricao });
        if (!validacaoDatas.valido) {
            return res.status(400).json({ erro: validacaoDatas.msg });
        }

        // Validação de status
        const validacaoStatus = validarStatusEvento(status);
        if (!validacaoStatus.valido) {
            return res.status(400).json({ erro: validacaoStatus.msg });
        }

        // Validação de capacidade
        const validacaoCapacidade = validarCapacidade(Number(capacidade_total));
        if (!validacaoCapacidade.valido) {
            return res.status(400).json({ erro: validacaoCapacidade.msg });
        }

        const evento = await Evento.create({
            titulo,
            percentual_desconto,
            frase_destaque,
            descricao,
            data_inicio,
            data_fim,
            horario_inicio,
            horario_fim,
            prazo_inscricao,
            abertura_inscricao,
            nome_local,
            endereco,
            cidade_uf_id,
            capacidade_total: Number(capacidade_total),
            categoria_evento,
            tema_central,
            status,
            link_lp,
            created_at,
            updated_at
        });
        return res.status(201).json(evento);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Controller para buscar evento por ID
const buscarEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await Evento.findByPk(id);
        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado' });
        }
        return res.status(200).json(evento);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Controller para listar todos os eventos com filtros
const listarEventos = async (req, res) => {
    try {
        const filtros = {};

        // Filtro case-insensitive para título
        if (req.query.titulo) {
            filtros.titulo = { [Op.iLike]: `%${req.query.titulo}%` };
        }
        if (req.query.status) {
            filtros.status = { [Op.iLike]: req.query.status };
        }
        if (req.query.categoria_evento) {
            filtros.categoria_evento = { [Op.iLike]: req.query.categoria_evento };
        }
        if (req.query.cidade_uf_id) {
            filtros.cidade_uf_id = req.query.cidade_uf_id;
        }

        // Validação e conversão de datas dd/mm/aaaa para yyyy-mm-dd
        function parseDataBRtoISO(dataStr) {
            const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            const match = dataStr.match(regex);
            if (!match) return null;
            const [ , dia, mes, ano ] = match;
            return `${ano}-${mes}-${dia}`;
        }

        if (req.query.data_inicio) {
            const validacao = validarDataEvento(req.query.data_inicio);
            if (!validacao.valido) {
                return res.status(400).json({ erro: `data_inicio: ${validacao.msg}` });
            }
            const dataISO = parseDataBRtoISO(req.query.data_inicio);
            if (!dataISO) {
                return res.status(400).json({ erro: 'Formato de data_inicio inválido. Use dd/mm/aaaa.' });
            }
            filtros.data_inicio = { [Op.gte]: dataISO };
        }
        if (req.query.data_fim) {
            const validacao = validarDataEvento(req.query.data_fim);
            if (!validacao.valido) {
                return res.status(400).json({ erro: `data_fim: ${validacao.msg}` });
            }
            const dataISO = parseDataBRtoISO(req.query.data_fim);
            if (!dataISO) {
                return res.status(400).json({ erro: 'Formato de data_fim inválido. Use dd/mm/aaaa.' });
            }
            filtros.data_fim = { [Op.lte]: dataISO };
        }

        const eventos = await Evento.findAll({
            where: filtros
        });

        res.status(200).json(eventos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar eventos', error });
    }
};

// Controller para atualizar um evento por ID
const atualizarEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await Evento.findByPk(id);
        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado' });
        }

        const {
            titulo,
            percentual_desconto,
            frase_destaque,
            descricao,
            data_inicio,
            data_fim,
            horario_inicio,
            horario_fim,
            prazo_inscricao,
            abertura_inscricao,
            nome_local,
            endereco,
            cidade_uf_id,
            capacidade_total,
            categoria_evento,
            tema_central,
            status,
            link_lp,
            updated_at
        } = req.body;

        // Validação de campos obrigatórios
        const camposObrigatorios = [
            'titulo', 'data_inicio', 'data_fim', 'horario_inicio', 'horario_fim',
            'prazo_inscricao', 'abertura_inscricao', 'nome_local', 'endereco',
            'cidade_uf_id', 'capacidade_total', 'categoria_evento', 'tema_central', 'status'
        ];
        const errosCampos = validarCamposObrigatoriosEvento(req.body, camposObrigatorios);
        if (errosCampos.length > 0) {
            return res.status(400).json({ erros: errosCampos });
        }

        // Validação individual de cada data
        const datasParaValidar = {
            data_inicio,
            data_fim,
            prazo_inscricao,
            abertura_inscricao
        };
        for (const [campo, valor] of Object.entries(datasParaValidar)) {
            const validacao = validarDataEvento(valor);
            if (!validacao.valido) {
                return res.status(400).json({ erro: `Campo ${campo}: ${validacao.msg}` });
            }
        }

        // Validação de datas
        const validacaoDatas = validarDatasEvento({ data_inicio, data_fim, prazo_inscricao, abertura_inscricao });
        if (!validacaoDatas.valido) {
            return res.status(400).json({ erro: validacaoDatas.msg });
        }

        // Validação de status
        const validacaoStatus = validarStatusEvento(status);
        if (!validacaoStatus.valido) {
            return res.status(400).json({ erro: validacaoStatus.msg });
        }

        // Validação de capacidade
        const validacaoCapacidade = validarCapacidade(Number(capacidade_total));
        if (!validacaoCapacidade.valido) {
            return res.status(400).json({ erro: validacaoCapacidade.msg });
        }

        await evento.update({
            titulo,
            percentual_desconto,
            frase_destaque,
            descricao,
            data_inicio,
            data_fim,
            horario_inicio,
            horario_fim,
            prazo_inscricao,
            abertura_inscricao,
            nome_local,
            endereco,
            cidade_uf_id,
            capacidade_total: Number(capacidade_total),
            categoria_evento,
            tema_central,
            status,
            link_lp,
            updated_at
        });

        return res.status(200).json(evento);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Controller para deletar um evento por ID
const deletarEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await Evento.findByPk(id);
        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado' });
        }
        await evento.destroy();
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { criarEvento, buscarEvento, listarEventos, atualizarEvento, deletarEvento }