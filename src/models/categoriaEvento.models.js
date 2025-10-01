const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const CategoriaEvento = sequelize.define('CategoriaEvento', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome_categoria: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'categorias_evento',
    timestamps: true,
});

module.exports = CategoriaEvento;