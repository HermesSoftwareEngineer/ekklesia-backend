const EventoAdministrador = require('../models/eventoAdministrador.models');
const Evento = require('../models/evento.models');
const TipoVaga = require('../models/tipoVaga.models');

/**
 * Middleware para verificar se o usuário é administrador do evento
 * 
 * @param {string} paramName - Nome do parâmetro que contém o ID do evento na requisição
 * @param {boolean} checkTipoVaga - Se verdadeiro, irá buscar o evento através do ID do tipo de vaga
 * @returns {Function} Middleware que verifica se o usuário é administrador do evento
 */
const isEventoAdmin = (paramName = 'id', checkTipoVaga = false) => {
    return async (req, res, next) => {
        try {
            // Verifica se o usuário é admin do sistema (pode acessar qualquer evento)
            if (req.user.tipoUsuario === 'admin') {
                return next();
            }

            // Obtém o ID do evento da requisição
            let eventoId;

            if (checkTipoVaga) {
                // Se estamos verificando um tipo de vaga, primeiro precisamos obter o evento_id
                const tipoVagaId = req.params[paramName];
                
                if (!tipoVagaId) {
                    return res.status(400).json({ 
                        aviso: "ID do tipo de vaga não fornecido" 
                    });
                }
                
                const tipoVaga = await TipoVaga.findByPk(tipoVagaId);
                
                if (!tipoVaga) {
                    return res.status(404).json({ 
                        aviso: "Tipo de vaga não encontrado" 
                    });
                }
                
                eventoId = tipoVaga.evento_id;
            } else {
                // Estamos verificando diretamente um evento
                eventoId = req.params[paramName];
                
                if (!eventoId) {
                    return res.status(400).json({ 
                        aviso: "ID do evento não fornecido" 
                    });
                }
                
                // Verifica se o evento existe
                const evento = await Evento.findByPk(eventoId);
                
                if (!evento) {
                    return res.status(404).json({ 
                        aviso: "Evento não encontrado" 
                    });
                }
            }

            // Verifica se o usuário é administrador do evento
            const isAdmin = await EventoAdministrador.findOne({
                where: {
                    user_id: req.user.id,
                    evento_id: eventoId
                }
            });

            if (!isAdmin) {
                return res.status(403).json({
                    aviso: "Você não tem permissão para administrar este evento"
                });
            }

            // Se chegou aqui, o usuário é administrador do evento
            req.eventoId = eventoId;  // Adiciona o ID do evento na requisição para uso posterior
            next();
        } catch (error) {
            console.error('Erro ao verificar administrador do evento:', error);
            res.status(500).json({
                aviso: "Erro interno ao verificar permissões",
                erro: error.message
            });
        }
    };
};

module.exports = { isEventoAdmin };