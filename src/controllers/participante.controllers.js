const Participante = require("../models/participante.models");

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
            idEnviado: id,
            participante: participante
        };

        res.status(200).json(resposta);
    }catch(error){
        res.status(500).json({erro: "Erro interno ao buscar participante"});
        console.error("Erro ao buscar participante:", error);
    }
};

module.exports = { buscarParticipante }