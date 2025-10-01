/**
 * Controlador para operações de CRUD de Categorias de Evento
 */
const CategoriaEvento = require('../models/categoriaEvento.models');
const { validarCategoriaEvento } = require('../validators/categoriaEvento.validators');

/**
 * Lista todas as categorias de evento cadastradas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function listarCategorias(req, res) {
    try {
        const categorias = await CategoriaEvento.findAll({
            order: [['nome_categoria', 'ASC']]
        });
        return res.status(200).json(categorias);
    } catch (error) {
        console.error('Erro ao listar categorias de evento:', error);
        return res.status(500).json({ message: 'Erro ao listar categorias de evento', error: error.message });
    }
}

/**
 * Busca uma categoria por ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function buscarCategoriaPorId(req, res) {
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
        const categoria = await CategoriaEvento.findByPk(idNumerico);
        
        if (!categoria) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        
        return res.status(200).json(categoria);
    } catch (error) {
        console.error(`Erro ao buscar categoria com ID ${id}:`, error);
        return res.status(500).json({ message: 'Erro ao buscar categoria', error: error.message });
    }
}

/**
 * Cadastra uma nova categoria de evento
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function cadastrarCategoria(req, res) {
    const dadosCategoria = req.body;
    
    // Validação dos dados
    const erros = validarCategoriaEvento(dadosCategoria);
    if (erros.length > 0) {
        return res.status(400).json({ message: 'Dados inválidos', errors: erros });
    }
    
    try {
        // Verifica se a categoria já existe com o mesmo nome
        const categoriaExistente = await CategoriaEvento.findOne({
            where: { 
                nome_categoria: dadosCategoria.nome_categoria
            }
        });
        
        if (categoriaExistente) {
            return res.status(400).json({ message: 'Categoria com este nome já existe' });
        }
        
        // Cria a categoria no banco
        const novaCategoria = await CategoriaEvento.create(dadosCategoria);
        return res.status(201).json(novaCategoria);
    } catch (error) {
        console.error('Erro ao cadastrar categoria de evento:', error);
        return res.status(500).json({ message: 'Erro ao cadastrar categoria de evento', error: error.message });
    }
}

/**
 * Atualiza os dados de uma categoria existente
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function atualizarCategoria(req, res) {
    const { id } = req.params;
    const dadosCategoria = req.body;
    
    if (!id) {
        return res.status(400).json({ message: 'ID não especificado' });
    }
    
    // Validar se o ID é um número inteiro
    const idNumerico = parseInt(id, 10);
    if (isNaN(idNumerico)) {
        return res.status(400).json({ message: 'ID deve ser um número inteiro válido' });
    }
    
    // Validação dos dados
    const erros = validarCategoriaEvento(dadosCategoria);
    if (erros.length > 0) {
        return res.status(400).json({ message: 'Dados inválidos', errors: erros });
    }
    
    try {
        // Verifica se a categoria existe
        const categoria = await CategoriaEvento.findByPk(idNumerico);
        
        if (!categoria) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        
        // Verifica se o nome já existe em outra categoria
        if (dadosCategoria.nome_categoria) {
            const categoriaExistente = await CategoriaEvento.findOne({
                where: { 
                    nome_categoria: dadosCategoria.nome_categoria,
                    id: { [require('sequelize').Op.ne]: idNumerico } // Não incluir o próprio registro na verificação
                }
            });
            
            if (categoriaExistente) {
                return res.status(400).json({ message: 'Já existe outra categoria com este nome' });
            }
        }
        
        // Atualiza os dados
        await categoria.update(dadosCategoria);
        return res.status(200).json(categoria);
    } catch (error) {
        console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
        return res.status(500).json({ message: 'Erro ao atualizar categoria', error: error.message });
    }
}

/**
 * Remove uma categoria do banco de dados
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function removerCategoria(req, res) {
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
        // Verifica se a categoria existe
        const categoria = await CategoriaEvento.findByPk(idNumerico);
        
        if (!categoria) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        
        // Remove a categoria
        await categoria.destroy();
        return res.status(200).json({ message: 'Categoria removida com sucesso' });
    } catch (error) {
        console.error(`Erro ao remover categoria com ID ${id}:`, error);
        return res.status(500).json({ message: 'Erro ao remover categoria', error: error.message });
    }
}

module.exports = {
    listarCategorias,
    buscarCategoriaPorId,
    cadastrarCategoria,
    atualizarCategoria,
    removerCategoria
};