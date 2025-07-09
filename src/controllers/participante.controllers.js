const Participante = require("../models/participante.models");
const { Op } = require('sequelize');

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
        const id = req.params.id;
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


// Nova função para listar todos os participantes com filtros
const listarParticipantes = async (req, res) => {
    try {
        // Filtros possíveis: nome_completo, cpf, email, cidade, uf
        const { nome_completo, cpf, email, cidade, uf } = req.query;

        // Monta objeto de filtros dinamicamente
        const filtros = {};
        if (nome_completo) filtros.nome_completo = { $iLike: `%${nome_completo}%` };
        if (cpf) filtros.cpf = cpf;
        if (email) filtros.email = { $like: `%${email}%` };
        if (cidade) filtros.cidade = { $iLike: `%${cidade}%` };
        if (uf) filtros.uf = uf;

        const where = {};
        if (filtros.nome_completo) {
            if (filtros.nome_completo.$iLike) {
                where.nome_completo = { [Op.iLike]: filtros.nome_completo.$iLike };
            } else {
                where.nome_completo = { [Op.like]: filtros.nome_completo.$like };
            }
        }
        if (filtros.cpf) where.cpf = filtros.cpf;
        if (filtros.email) where.email = { [Op.like]: filtros.email.$like };
        if (filtros.cidade) {
            if (filtros.cidade.$iLike) {
                where.cidade = { [Op.iLike]: filtros.cidade.$iLike };
            } else {
                where.cidade = { [Op.like]: filtros.cidade.$like };
            }
        }
        if (filtros.uf) where.uf = filtros.uf;

        const participantes = await Participante.findAll({ where });
        res.status(200).json({
            aviso: "Participantes encontrados!",
            participantes: participantes
        });
    } catch (error) {
        res.status(500).send("Erro interno ao listar participantes.");
        console.error("Erro ao listar participantes:", error);
    }
};

module.exports = { listarParticipantes, buscarParticipante, cadastrarParticipante, atualizarDadosParticipante, deletarParticipante }