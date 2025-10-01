const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const CidadeUF = sequelize.define('CidadeUF', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cidade: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uf: {
        type: DataTypes.STRING(2),
        allowNull: false
    }
}, {
    tableName: 'cidades_uf',
    timestamps: true
});

module.exports = CidadeUF;