const Participante = require("../models/participante.models");
const { validarCPF, verificarCamposObrigatorios, validarUF, validarData, validarEmail } = require("../validators/participante.validators");

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

        // Organizar dados da requisicao
        const { nome_completo, cpf, email, telefone, data_nascimento, endereco, cidade, uf } = req.body;

        const user_id = req.user["id"];

        const dadosRequisicao = {
            ...req.body,
            user_id
        }

        // Verificar campos obrigatórios
        const errorsCamposObrigatorios = verificarCamposObrigatorios(dadosRequisicao, ['nome_completo', 'user_id', 'cpf']);
        if (errorsCamposObrigatorios.length > 0) {
            res.status(422).json({aviso: errorsCamposObrigatorios.join(" ")});
            return;
        };

        // Validar CPF
        const  validacaoCPF = validarCPF(cpf);
        if (!validacaoCPF.valido) {
            res.status(400).json({aviso: validacaoCPF.msg});
            return;
        };

        // Validar UF
        const validacaoUF = validarUF(uf);
        if (!validacaoUF.valido) {
            res.status(400).json({aviso: validacaoUF.msg});
            return;
        };

        // Validar e-mail
        const validacaoEmail = validarEmail(email);
        if (!validacaoEmail.valido) {
            res.status(400).json({aviso: validacaoEmail.msg});
            return;
        };

        // Validar Data
        const validacaoData = validarData(data_nascimento);
        if (!validacaoData.valido) {
            res.status(400).json({aviso: validacaoData.msg});
            return;
        };
        
        // Formata a data no formato correto
        const [dia, mes, ano] = data_nascimento.split("/");
        const dataFormatada = `${ano}-${mes}-${dia}`;
        
        const participante = await Participante.create({
            user_id,
            nome_completo,
            cpf,
            email,
            telefone,
            data_nascimento: dataFormatada,
            endereco,
            cidade,
            uf,
        });

        res.status(201).json({
            aviso: "Participante cadastrado com sucesso!",
            participante: participante
        });

    } catch (error) {
        res.status(500).send("Erro interno ao cadastrar participante.");
        console.error("Erro ao cadastrar participante:", error);
    };
};

const atualizarDadosParticipante = async (req, res) => {
    try {
        
        if (!req.body) {
            res.status(400).json({ aviso: "Corpo da requisição ausente." });
            return;
        }

        const { id, nome_completo, cpf, email, telefone, data_nascimento, endereco, cidade, uf } = req.body;

        const user_id = req.user["id"];
        
        if (!user_id) {
            res.status(401).json({aviso: "Usuário não identificado!"});
            return;
        };

        if (!id) {
            res.status(400).json({aviso: "ID do participante não identificado."});
            return;
        };

        const listaParticipantes = await Participante.findAll({
            where: {
                id
            }
        });

        const participante = listaParticipantes[0]

        if (participante.dataValues.user_id != user_id) {
            res.status(401).json({aviso: "Usuário não autorizado!"});
            return;
        };

        // VALIDAÇÃO DE DADOS

        if(data_nascimento){
            const [dia, mes, ano] = data_nascimento.split("/");
            const data_formatada = `${ano}-${mes}-${dia}`;
        } else {
            const data_formatada = data_nascimento
        };
        
        console.log("CPF", cpf)
        if (cpf !== undefined){
            if ((cpf.length != 11) || !isNumericString(cpf)) {
                res.status(401).json({aviso: "O CPF precisa ter 11 dígitos e conter apenas números"});
                return;
            };
        }
        
        if (uf.length != 2) {
            res.status(401).json({aviso: "O UF precisa ter apenas 2 dígitos!"});
            return;
        }

        // ATUALIZAÇÃO DA INSTÂNCIA

        await participante.update({
            nome_completo,
            cpf,
            email,
            telefone,
            data_nascimento,
            endereco,
            cidade,
            uf
        });

        res.status(200).json({
            aviso: "Participante atualizado com sucesso!",
            participante: participante
        });
        
    } catch (error) {
        res.status(500).send("Erro interno ao atualizar participante.");
        console.error("Erro ao atualizar participante:", error);
    }
}

module.exports = { buscarParticipante, cadastrarParticipante, atualizarDadosParticipante }