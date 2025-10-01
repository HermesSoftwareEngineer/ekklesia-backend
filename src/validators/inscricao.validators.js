/**
 * Módulo de validações para inscrições
 * Contém funções específicas para validação de dados de inscrições
 */

const { verificarCamposObrigatorios, validarNumero, validarValorPermitido } = require('./comum.validators');

/**
 * Valida campos obrigatórios para inscrição
 * @param {Object} dadosInscricao - Dados da inscrição a serem validados
 * @returns {Array} - Array vazio se não houver erros, ou array com mensagens de erro
 */
function verificarCamposObrigatoriosInscricao(dadosInscricao) {
    const camposObrigatorios = ['evento_id', 'participante_id', 'tipo_vaga_id'];
    return verificarCamposObrigatorios(dadosInscricao, camposObrigatorios);
}

/**
 * Valida preço final da inscrição
 * @param {Number} precoFinal - Preço final a ser validado
 * @returns {Object} - Objeto com propriedades 'valido' e 'msg'
 */
function validarPrecoFinal(precoFinal) {
    return validarNumero(precoFinal, { min: 0 });
}

/**
 * Valida status da inscrição
 * @param {string} status - Status a ser validado
 * @returns {Object} - Objeto com propriedades 'valido' e 'msg'
 */
function validarStatusInscricao(status) {
    const statusPermitidos = ['Pendente', 'Pago', 'Cancelado'];
    return validarValorPermitido(status, statusPermitidos, 'Status de inscrição');
}

module.exports = {
    verificarCamposObrigatoriosInscricao,
    validarPrecoFinal,
    validarStatusInscricao
};