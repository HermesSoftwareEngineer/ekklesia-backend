const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const User = sequelize.define(
    'User', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        nome_completo: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        cpf: {
            type: DataTypes.STRING(11),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        telefone: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        data_nascimento: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        endereco: {
            type: DataTypes.STRING,
        },
        cidade: {
            type: DataTypes.STRING,
        },
        uf: {
            type: DataTypes.STRING(2),
        },
    },
    {
        //Other options for model here1
    },
);

(async () => {
    try {
        await User.sync({ alter: true })
        console.log("Modelo User sincronizado! Tipo de sincronização: alter.")
    } catch (error) {
        console.error("Erro ao sincronizar modelo USER:", error)
    }
})();

module.exports = User;