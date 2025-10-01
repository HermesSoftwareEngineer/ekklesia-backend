/**
 * Validações específicas para o modelo CidadeUF
 */

const { verificarCamposObrigatorios, validarValorPermitido } = require('./comum.validators');

/**
 * Lista de UFs válidas no Brasil
 */
const UFS_VALIDAS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

/**
 * Valida os dados de uma CidadeUF
 * @param {Object} cidadeUF - Objeto contendo os dados da cidade/UF
 * @returns {Array} - Array com erros de validação, vazio se não houver erros
 */
function validarCidadeUF(cidadeUF) {
    let erros = [];
    
    // Verifica campos obrigatórios
    erros = erros.concat(verificarCamposObrigatorios(cidadeUF, ['cidade', 'uf']));
    
    // Valida o formato da UF
    if (cidadeUF.uf) {
        // Converte para maiúsculas para padronizar
        const uf = cidadeUF.uf.toUpperCase();
        
        // Verifica se é uma UF válida
        const resultadoValidacao = validarValorPermitido(uf, UFS_VALIDAS, 'UF');
        if (!resultadoValidacao.valido) {
            erros.push(resultadoValidacao.msg);
        }
    }
    
    // Valida o tamanho do nome da cidade (mínimo de 2 caracteres)
    if (cidadeUF.cidade && cidadeUF.cidade.trim().length < 2) {
        erros.push('Nome da cidade deve ter pelo menos 2 caracteres');
    }
    
    return erros;
}

module.exports = {
    validarCidadeUF,
    UFS_VALIDAS
};