/**
 * Middleware para cálculo de preços de inscrição
 */
const { TipoVaga, Evento } = require('../models');
const { isEventoAdmin } = require('./eventoAdminMiddleware');

/**
 * Calcula os preços para a inscrição com base no tipo de vaga e nas regras de desconto
 * O preço inicial é obtido do tipo de vaga
 * O desconto autorizado é calculado com base no percentual de desconto do evento
 * Admins do sistema ou do evento podem aplicar descontos adicionais
 */
const calcularPrecos = async (req, res, next) => {
    try {
        // Verificar se é uma rota de cadastro ou atualização de inscrição
        if (req.method !== 'POST' && req.method !== 'PUT') {
            return next();
        }

        // Variáveis para armazenar os dados necessários para o cálculo
        let evento_id, tipo_vaga_id, desconto_admin;
        
        // Obter os dados com base no tipo de requisição
        if (req.method === 'POST') {
            // Para cadastro, obter os dados do corpo da requisição
            evento_id = req.body.evento_id;
            tipo_vaga_id = req.body.tipo_vaga_id;
            desconto_admin = req.body.desconto_admin;
        } else if (req.method === 'PUT') {
            // Para atualização, precisamos verificar se estão atualizando o tipo de vaga
            // ou aplicando um novo desconto
            tipo_vaga_id = req.body.tipo_vaga_id;
            desconto_admin = req.body.desconto_admin;
            
            // Se não estiver atualizando o tipo de vaga e nem aplicando desconto, não precisa recalcular
            if (!tipo_vaga_id && desconto_admin === undefined) {
                return next();
            }
            
            // Se estiver atualizando, precisamos buscar a inscrição para obter o evento_id
            // e o tipo de vaga atual se não estiver sendo alterado
            const { Inscricao } = require('../models');
            const inscricao = await Inscricao.findByPk(req.params.id);
            
            if (!inscricao) {
                return next(); // Deixe o controller lidar com inscrição não encontrada
            }
            
            evento_id = inscricao.evento_id;
            
            // Se não estiver atualizando o tipo de vaga, usar o atual
            if (!tipo_vaga_id) {
                tipo_vaga_id = inscricao.tipo_vaga_id;
            }
        }
        
        // Verificar se temos os dados necessários para o cálculo
        if (!evento_id || !tipo_vaga_id) {
            return next(); // Deixe a validação dos campos obrigatórios para o controller
        }

        // Buscar o tipo de vaga para obter o preço inicial
        const tipoVaga = await TipoVaga.findByPk(tipo_vaga_id);
        if (!tipoVaga) {
            return next(); // Deixe a validação da existência do tipo de vaga para o controller
        }
        
        // Buscar o evento para obter o percentual de desconto
        const evento = await Evento.findByPk(evento_id);
        if (!evento) {
            return next(); // Deixe a validação da existência do evento para o controller
        }

        // Definir o preço inicial a partir do tipo de vaga
        const preco_inicial = parseFloat(tipoVaga.preco);
        
        // Calcular o desconto autorizado padrão baseado no percentual do evento
        let desconto_autorizado = 0;
        if (evento.percentual_desconto) {
            desconto_autorizado = (parseFloat(evento.percentual_desconto) / 100) * preco_inicial;
        }

        // Verificar se o usuário é admin do sistema ou do evento para permitir desconto adicional
        let isAdmin = false;
        
        // Verificar se o usuário é admin do sistema
        if (req.user.tipoUsuario === 'admin') {
            isAdmin = true;
        } else {
            // Verificar se o usuário é admin do evento
            try {
                const EventoAdministrador = require('../models/eventoAdministrador.models');
                const adminEvento = await EventoAdministrador.findOne({
                    where: {
                        user_id: req.user.id,
                        evento_id: evento_id
                    }
                });
                if (adminEvento) {
                    isAdmin = true;
                }
            } catch (error) {
                console.error('Erro ao verificar se é admin do evento:', error);
            }
        }

        let desconto_calculado = desconto_autorizado;

        // Se for admin e informou um desconto adicional
        if (isAdmin && desconto_admin !== undefined) {
            // Permitir que o admin defina um desconto específico
            desconto_calculado = parseFloat(desconto_admin);
        }

        // Garantir que o desconto não seja maior que o preço
        if (desconto_calculado > preco_inicial) {
            desconto_calculado = preco_inicial;
        }

        // Calcular o preço final
        const preco_final = preco_inicial - desconto_calculado;

        // Adicionar os valores calculados ao body da requisição
        req.body.preco_inicial = preco_inicial;
        req.body.desconto_autorizado = desconto_calculado;
        req.body.preco_final = preco_final;

        next();
    } catch (error) {
        console.error('Erro no middleware de cálculo de preços:', error);
        return res.status(500).json({ 
            aviso: "Erro interno ao calcular preços", 
            erro: error.message 
        });
    }
};

module.exports = { calcularPrecos };