const Participante = require("../models/participante.models");
const { isNumericString }= require("../utils/strings.utils");

const buscarParticipante = async (req, res) => {
    try {
        const id = req.params.id;
        
        const participante = await Participante.findByPk(id);

        if (participante === null) {
            res.status(404).json({aviso: "Participante não encontrado!"});
            return;
        }
        const resposta = {
            aviso: "Participante encontrado!",
            participante: participante
        };

        res.status(200).json(resposta);
    } catch (error) {
        res.status(500).send("Erro interno ao buscar participante");
        console.error("Erro ao buscar participante:", error);
    }
};

const cadastrarParticipante = async (req, res) => {
    try {
        const { nome_completo, cpf, email, telefone, data_nascimento, endereco, cidade, uf } = req.body;

        const user_id = req.user["id"];

        const [dia, mes, ano] = data_nascimento.split("/");
        const data_formatada = `${ano}-${mes}-${dia}`;

        if (!nome_completo || !cpf) {
            res.status(401).json({aviso: "Nome completo e CPF são obrigatórios!"});
            return;
        };

        if ((cpf.length != 11) || !isNumericString(cpf)) {
            res.status(401).json({aviso: "O CPF precisa ter 11 dígitos e conter apenas números"});
            return;
        };

        if (uf.length != 2) {
            res.status(401).json({aviso: "O UF precisa ter apenas 2 dígitos!"});
            return;
        }
        
        const participante = await Participante.create({
            user_id,
            nome_completo,
            cpf,
            email,
            telefone,
            data_nascimento: data_formatada,
            endereco,
            cidade,
            uf,
        });

        res.status(201).json({
            aviso: "Participante cadastrado com sucesso!",
            participante: participante
        });

    } catch (error) {
        res.status(500).send("Erro interno ao cadastrar participante");
        console.error("Erro ao cadastrar participante:", error);
    }
}

module.exports = { buscarParticipante, cadastrarParticipante }