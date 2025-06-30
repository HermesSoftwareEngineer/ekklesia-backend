const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config');

const User = sequelize.define(
    'User', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        senhaHash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        telefone: {
            type: DataTypes.STRING(20),
        },
        dataNascimento: {
            type: DataTypes.DATEONLY,
        },
        tipoUsuario: {
            type: DataTypes.ENUM("admin", "user"),
            defaultValue: "user",
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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