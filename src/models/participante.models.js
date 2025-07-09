const sequelize = require("../config/db.config");
const { DataTypes } = require("sequelize");
const User = require("./users.models");

const Participante = sequelize.define(
    "Participante",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nome_completo: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        cpf: {
            type: DataTypes.STRING(11),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
        },
        telefone: {
            type: DataTypes.STRING(20),
        },
        data_nascimento: {
            type: DataTypes.DATEONLY,
        },
        endereco: {
            type: DataTypes.STRING(255),
        },
        cidade: {
            type: DataTypes.STRING,
        },
        uf: {
            type: DataTypes.STRING(2),
        },
    },
    {
        // Outras confifurações vão aqui
        tableName: "Participantes",
    }
);

Participante.belongsTo(User, {
    foreignKey: "user_id",
});

User.hasMany(Participante, {
    foreignKey: "user_id",
});

(async () => {
    try {
        await Participante.sync({ alter: true });
        console.log("Modelo Participante sincronizado! Tipo de sincronização: alter.");
    }catch (error) {
        console.error("Erro ao sincronizar modelo PARTICIPANTE:", error);
    }
})();

module.exports = Participante;