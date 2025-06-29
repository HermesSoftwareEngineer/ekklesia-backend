const sequelize = require("../config/db.config");
const { DataTypes } = require("sequelize");

const Participante = sequelize.define(
    "Participante",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
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

(async () => {
    try {
        await Participante.sync({ alter: true });
        console.log("Modelo Participante sincronizado! Tipo de sincronização: alter.");
    }catch (error) {
        console.error("Erro ao sincronizar modelo PARTICIPANTE:", error);
    }
})();

module.exports = Participante;