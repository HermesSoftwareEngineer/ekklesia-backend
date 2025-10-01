const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Evento = require('./evento.models');

const TipoVaga = sequelize.define(
    'TipoVaga',
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
        nome_vaga: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        preco: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        quantidade_total: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantidade_disponivel: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        data_inicio: {
            type: DataTypes.DATE,
        },
        data_fim: {
            type: DataTypes.DATE,
        },
    },
    {
        // Opções adicionais do modelo
        tableName: 'tipo_vagas', // Nome da tabela no banco de dados
        timestamps: true, // Habilitando os campos created_at e updated_at
    }
);

// Definindo a relação com o modelo Evento
TipoVaga.belongsTo(Evento, { foreignKey: 'evento_id' });
Evento.hasMany(TipoVaga, { foreignKey: 'evento_id' });

module.exports = TipoVaga;
