const sequelize = require('../config/db.config');
const User = require('./users.models');
const Participante = require('./participante.models');
const Evento = require('./evento.models');
const TipoVaga = require('./tipoVaga.models');
const EventoAdministrador = require('./eventoAdministrador.models');
const Inscricao = require('./inscricao.models');

// Relacionamentos
Participante.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Participante, { foreignKey: 'user_id' });

// Relacionamentos para Inscricao
Inscricao.belongsTo(Evento, { foreignKey: 'evento_id', as: 'evento' });
Inscricao.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Inscricao.belongsTo(Participante, { foreignKey: 'participante_id', as: 'participante' });
Inscricao.belongsTo(TipoVaga, { foreignKey: 'tipo_vaga_id', as: 'tipoVaga' });

Evento.hasMany(Inscricao, { foreignKey: 'evento_id', as: 'inscricoes' });
User.hasMany(Inscricao, { foreignKey: 'user_id', as: 'inscricoes' });
Participante.hasMany(Inscricao, { foreignKey: 'participante_id', as: 'inscricoes' });
TipoVaga.hasMany(Inscricao, { foreignKey: 'tipo_vaga_id', as: 'inscricoes' });

// Relacionamento TipoVaga com Evento já está definido no modelo tipoVaga.models.js

// Adicione outros relacionamentos aqui, se necessário

// Sincronização centralizada
async function syncModels() {
  try {
    // Primeiro sincronizamos os modelos independentes
    await User.sync({ alter: true });
    await Evento.sync({ alter: true });
    
    // Depois os modelos que dependem dos primeiros
    await Participante.sync({ alter: true });
    await TipoVaga.sync({ alter: true });
    await EventoAdministrador.sync({ alter: true });
    
    // Por último, o modelo que depende de vários outros
    await Inscricao.sync({ alter: true });
    
    console.log('Todos os modelos foram sincronizados com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar modelos:', error);
  }
}

// Sincronize automaticamente ao importar este arquivo
syncModels();

module.exports = {
  sequelize,
  User,
  Participante,
  Evento,
  TipoVaga,
  EventoAdministrador,
  Inscricao,
};
