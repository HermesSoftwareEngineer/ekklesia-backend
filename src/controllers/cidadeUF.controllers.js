/**
 * Controlador para operações de CRUD de Cidades e UFs
 */
const CidadeUF = require('../models/cidadeUF.models');
const { validarCidadeUF } = require('../validators/cidadeUF.validators');

/**
 * Lista todas as cidades cadastradas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function listarCidades(req, res) {
    try {
        const cidades = await CidadeUF.findAll({
            order: [['uf', 'ASC'], ['cidade', 'ASC']]
        });
        return res.status(200).json(cidades);
    } catch (error) {
        console.error('Erro ao listar cidades:', error);
        return res.status(500).json({ message: 'Erro ao listar cidades', error: error.message });
    }
}

/**
 * Lista cidades por UF específica
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function listarCidadesPorUF(req, res) {
    const { uf } = req.params;
    
    if (!uf) {
        return res.status(400).json({ message: 'UF não especificada' });
    }
    
    try {
        const cidades = await CidadeUF.findAll({
            where: { uf: uf.toUpperCase() },
            order: [['cidade', 'ASC']]
        });
        return res.status(200).json(cidades);
    } catch (error) {
        console.error(`Erro ao listar cidades para UF ${uf}:`, error);
        return res.status(500).json({ message: 'Erro ao listar cidades por UF', error: error.message });
    }
}

/**
 * Busca uma cidade por ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function buscarCidadePorId(req, res) {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ message: 'ID não especificado' });
    }
    
    // Validar se o ID é um número inteiro
    const idNumerico = parseInt(id, 10);
    if (isNaN(idNumerico)) {
        return res.status(400).json({ message: 'ID deve ser um número inteiro válido' });
    }
    
    try {
        const cidade = await CidadeUF.findByPk(idNumerico);
        
        if (!cidade) {
            return res.status(404).json({ message: 'Cidade não encontrada' });
        }
        
        return res.status(200).json(cidade);
    } catch (error) {
        console.error(`Erro ao buscar cidade com ID ${id}:`, error);
        return res.status(500).json({ message: 'Erro ao buscar cidade', error: error.message });
    }
}

/**
 * Cadastra uma nova cidade
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function cadastrarCidade(req, res) {
    const dadosCidade = req.body;
    
    // Validação dos dados
    const erros = validarCidadeUF(dadosCidade);
    if (erros.length > 0) {
        return res.status(400).json({ message: 'Dados inválidos', errors: erros });
    }
    
    // Padroniza a UF para maiúsculas
    dadosCidade.uf = dadosCidade.uf.toUpperCase();
    
    try {
        // Verifica se a cidade já existe com o mesmo nome e UF
        const cidadeExistente = await CidadeUF.findOne({
            where: { 
                cidade: dadosCidade.cidade,
                uf: dadosCidade.uf
            }
        });
        
        if (cidadeExistente) {
            return res.status(400).json({ message: 'Cidade já cadastrada para esta UF' });
        }
        
        // Cria a cidade no banco
        const novaCidade = await CidadeUF.create(dadosCidade);
        return res.status(201).json(novaCidade);
    } catch (error) {
        console.error('Erro ao cadastrar cidade:', error);
        return res.status(500).json({ message: 'Erro ao cadastrar cidade', error: error.message });
    }
}

/**
 * Atualiza os dados de uma cidade existente
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function atualizarCidade(req, res) {
    const { id } = req.params;
    const dadosCidade = req.body;
    
    if (!id) {
        return res.status(400).json({ message: 'ID não especificado' });
    }
    
    // Validar se o ID é um número inteiro
    const idNumerico = parseInt(id, 10);
    if (isNaN(idNumerico)) {
        return res.status(400).json({ message: 'ID deve ser um número inteiro válido' });
    }
    
    // Validação dos dados
    const erros = validarCidadeUF(dadosCidade);
    if (erros.length > 0) {
        return res.status(400).json({ message: 'Dados inválidos', errors: erros });
    }
    
    // Padroniza a UF para maiúsculas
    if (dadosCidade.uf) {
        dadosCidade.uf = dadosCidade.uf.toUpperCase();
    }
    
    try {
        // Verifica se a cidade existe
        const cidade = await CidadeUF.findByPk(idNumerico);
        
        if (!cidade) {
            return res.status(404).json({ message: 'Cidade não encontrada' });
        }
        
        // Verifica se a combinação cidade+UF já existe em outro registro
        if (dadosCidade.cidade && dadosCidade.uf) {
            const cidadeExistente = await CidadeUF.findOne({
                where: { 
                    cidade: dadosCidade.cidade,
                    uf: dadosCidade.uf,
                    id: { [require('sequelize').Op.ne]: id } // Não incluir o próprio registro na verificação
                }
            });
            
            if (cidadeExistente) {
                return res.status(400).json({ message: 'Cidade já cadastrada para esta UF' });
            }
        }
        
        // Atualiza os dados
        await cidade.update(dadosCidade);
        return res.status(200).json(cidade);
    } catch (error) {
        console.error(`Erro ao atualizar cidade com ID ${id}:`, error);
        return res.status(500).json({ message: 'Erro ao atualizar cidade', error: error.message });
    }
}

/**
 * Remove uma cidade do banco de dados
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function removerCidade(req, res) {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ message: 'ID não especificado' });
    }
    
    // Validar se o ID é um número inteiro
    const idNumerico = parseInt(id, 10);
    if (isNaN(idNumerico)) {
        return res.status(400).json({ message: 'ID deve ser um número inteiro válido' });
    }
    
    try {
        // Verifica se a cidade existe
        const cidade = await CidadeUF.findByPk(idNumerico);
        
        if (!cidade) {
            return res.status(404).json({ message: 'Cidade não encontrada' });
        }
        
        // Remove a cidade
        await cidade.destroy();
        return res.status(200).json({ message: 'Cidade removida com sucesso' });
    } catch (error) {
        console.error(`Erro ao remover cidade com ID ${id}:`, error);
        return res.status(500).json({ message: 'Erro ao remover cidade', error: error.message });
    }
}

/**
 * Lista todas as UFs distintas cadastradas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function listarUFs(req, res) {
    try {
        const ufs = await CidadeUF.findAll({
            attributes: ['uf'],
            group: ['uf'],
            order: [['uf', 'ASC']]
        });
        
        const listaUFs = ufs.map(item => item.uf);
        return res.status(200).json(listaUFs);
    } catch (error) {
        console.error('Erro ao listar UFs:', error);
        return res.status(500).json({ message: 'Erro ao listar UFs', error: error.message });
    }
}

module.exports = {
    listarCidades,
    listarCidadesPorUF,
    buscarCidadePorId,
    cadastrarCidade,
    atualizarCidade,
    removerCidade,
    listarUFs
};