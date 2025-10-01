/**
 * Validações específicas para o modelo CategoriaEvento
 */

const { verificarCamposObrigatorios } = require('./comum.validators');

/**
 * Valida os dados de uma CategoriaEvento
 * @param {Object} categoriaEvento - Objeto contendo os dados da categoria
 * @returns {Array} - Array com erros de validação, vazio se não houver erros
 */
function validarCategoriaEvento(categoriaEvento) {
    let erros = [];
    
    // Verifica campos obrigatórios
    erros = erros.concat(verificarCamposObrigatorios(categoriaEvento, ['nome_categoria']));
    
    // Valida o tamanho do nome da categoria (mínimo de 2 caracteres)
    if (categoriaEvento.nome_categoria && categoriaEvento.nome_categoria.trim().length < 2) {
        erros.push('O nome da categoria deve ter pelo menos 2 caracteres');
    }
    
    return erros;
}

module.exports = {
    validarCategoriaEvento
};