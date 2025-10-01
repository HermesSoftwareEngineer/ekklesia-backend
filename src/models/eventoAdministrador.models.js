const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./users.models');
const Evento = require('./evento.models');

const EventoAdministrador = sequelize.define(
    'EventoAdministrador',
    {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: User,
                key: 'id'
            }
        },
        evento_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: Evento,
                key: 'id'
            }
        }
    },
    {
        tableName: 'evento_administradores',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'evento_id']
            }
        ]
    }
);

// Estabelecendo as relações
User.belongsToMany(Evento, { 
    through: EventoAdministrador,
    foreignKey: 'user_id',
    otherKey: 'evento_id',
    as: 'eventosAdministrados'
});

Evento.belongsToMany(User, {
    through: EventoAdministrador,
    foreignKey: 'evento_id',
    otherKey: 'user_id',
    as: 'administradores'
});

// Definindo as associações da tabela de junção com os modelos
EventoAdministrador.belongsTo(User, { foreignKey: 'user_id' });
EventoAdministrador.belongsTo(Evento, { foreignKey: 'evento_id' });

module.exports = EventoAdministrador;