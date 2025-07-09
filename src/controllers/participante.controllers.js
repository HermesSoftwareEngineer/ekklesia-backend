const Participante = require("../models/participante.models");
const { validarCPF, verificarCamposObrigatorios, validarUF, validarData, validarEmail, validarIdParticipante } = require("../validators/participante.validators");

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
        // Pega dados da requisição
        const { nome_completo, cpf, email, telefone, data_nascimento, endereco, cidade, uf } = req.body;
        const id = req.query.id;
        const user_id = req.user["id"];

        // Valida envio do corpo da requisição
        if (!req.body) {
            res.status(400).json({ aviso: "Corpo da requisição ausente." });
            return;
        }

        // Validação do id do participante
        const validacaoParticipante = await validarIdParticipante(id);
        if (!validacaoParticipante.valido) {
            res.status(400).json({ aviso: validacaoParticipante.msg });
            return;
        }

        // Busca o participante para atualizar
        const participante = await Participante.findByPk(id);
        if (!participante) {
            res.status(404).json({ aviso: "Participante não encontrado!" });
            return;
        }

        // Validação dos campos (se enviados)
        if (cpf !== undefined) {
            const validacaoCPF = validarCPF(cpf);
            if (!validacaoCPF.valido) {
                res.status(400).json({ aviso: validacaoCPF.msg });
                return;
            }
        }

        if (uf !== undefined) {
            const validacaoUF = validarUF(uf);
            if (!validacaoUF.valido) {
                res.status(400).json({ aviso: validacaoUF.msg });
                return;
            }
        }

        if (email !== undefined) {
            const validacaoEmail = validarEmail(email);
            if (!validacaoEmail.valido) {
                res.status(400).json({ aviso: validacaoEmail.msg });
                return;
            }
        }

        let dataFormatada = data_nascimento;
        if (data_nascimento !== undefined) {
            const validacaoData = validarData(data_nascimento);
            if (!validacaoData.valido) {
                res.status(400).json({ aviso: validacaoData.msg });
                return;
            }
            // Formata a data para YYYY-MM-DD
            const [dia, mes, ano] = data_nascimento.split("/");
            dataFormatada = `${ano}-${mes}-${dia}`;
        }

        // Atualiza os dados do participante
        await participante.update({
            nome_completo,
            cpf,
            email,
            telefone,
            data_nascimento: dataFormatada,
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
};

const deletarParticipante = async (req, res) => {
    try {
        const id = req.params.id;

        // Validação do id do participante
        const validacaoParticipante = await validarIdParticipante(id);
        if (!validacaoParticipante.valido) {
            res.status(400).json({ aviso: validacaoParticipante.msg });
            return;
        }

        // Busca o participante para deletar
        const participante = await Participante.findByPk(id);
        if (!participante) {
            res.status(404).json({ aviso: "Participante não encontrado!" });
            return;
        }

        await participante.destroy();

        res.status(200).json({ aviso: "Participante deletado com sucesso!" });
    } catch (error) {
        res.status(500).send("Erro interno ao deletar participante.");
        console.error("Erro ao deletar participante:", error);
    }
};

module.exports = { buscarParticipante, cadastrarParticipante, atualizarDadosParticipante, deletarParticipante }