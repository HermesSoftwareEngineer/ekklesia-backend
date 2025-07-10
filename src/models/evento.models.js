
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Evento = sequelize.define(
    'Evento',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        percentual_desconto: {
            type: DataTypes.DECIMAL(5, 2),
        },
        frase_destaque: {
            type: DataTypes.STRING,
        },
        descricao: {
            type: DataTypes.TEXT,
        },
        data_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        data_fim: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        horario_inicio: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        horario_fim: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        prazo_inscricao: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        abertura_inscricao: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        nome_local: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        endereco: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cidade_uf_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // references: { model: 'CidadeUF', key: 'id' },
        },
        capacidade_total: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        categoria_evento: {
            type: DataTypes.STRING,
            allowNull: false,
            // references: { model: 'CategoriasEvento', key: 'nome_categoria' },
        },
        tema_central: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Ativo', 'Rascunho', 'Desativado', 'Encerrado', 'Cancelado'),
            allowNull: false,
            defaultValue: 'Ativo',
        },
        link_lp: {
            type: DataTypes.STRING,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
    tableName: 'Evento',
    timestamps: false,
});

module.exports = Evento;
