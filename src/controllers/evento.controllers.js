const Evento = require('../models/evento.models');
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

module.exports = { criarEvento, buscarEvento }