const sequelize = require('../config/db.config');
const User = require('./users.models');
const Participante = require('./participante.models');
const Evento = require('./evento.models');

// Relacionamentos
Participante.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Participante, { foreignKey: 'user_id' });

// Adicione outros relacionamentos aqui, se necessário

// Sincronização centralizada
async function syncModels() {
  try {
    await User.sync({ alter: true });
    await Participante.sync({ alter: true });
    await Evento.sync({ alter: true });
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
};
