const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Evento = require('./evento.models');
const User = require('./users.models');
const Participante = require('./participante.models');
const TipoVaga = require('./tipoVaga.models');

const Inscricao = sequelize.define(
    'Inscricao',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        evento_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Evento,
                key: 'id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },
        participante_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Participante,
                key: 'id'
            }
        },
        tipo_vaga_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: TipoVaga,
                key: 'id'
            }
        },
        preco_inicial: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        desconto_autorizado: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        preco_final: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status_inscricao: {
            type: DataTypes.ENUM('Pendente', 'Pago', 'Cancelado'),
            allowNull: false,
            defaultValue: 'Pendente'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'Inscricoes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['evento_id', 'participante_id']
            }
        ]
    }
);

module.exports = Inscricao;
