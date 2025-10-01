/**
 * Módulo de validações genéricas
 * Contém funções reutilizáveis para validação de dados em diferentes partes da aplicação
 */

/**
 * Valida se os campos obrigatórios estão presentes no objeto
 * @param {Object} obj - Objeto contendo os dados a serem validados
 * @param {Array} campos - Array com os nomes dos campos obrigatórios
 * @returns {Array} - Array vazio se não houver erros, ou array com mensagens de erro
 */
function verificarCamposObrigatorios(obj, campos = []) {
    const erros = [];
    campos.forEach(campo => {
        if (obj[campo] === undefined || obj[campo] === null || obj[campo] === '') {
            erros.push(`Campo ${campo} faltando!`);
        }
    });
    return erros;
}

/**
 * Valida se um valor numérico é válido
 * @param {Number} valor - Valor a ser validado
 * @param {Object} opcoes - Opções de validação (min, max)
 * @returns {Object} - Objeto com propriedades 'valido' e 'msg'
 */
function validarNumero(valor, opcoes = {}) {
    const { min, max } = opcoes;

    if (isNaN(parseFloat(valor))) {
        return { valido: false, msg: 'Valor numérico inválido!' };
    }

    if (min !== undefined && valor < min) {
        return { valido: false, msg: `Valor deve ser maior ou igual a ${min}` };
    }

    if (max !== undefined && valor > max) {
        return { valido: false, msg: `Valor deve ser menor ou igual a ${max}` };
    }

    return { valido: true };
}

/**
 * Valida se um valor está dentro de um conjunto de valores permitidos
 * @param {any} valor - Valor a ser validado
 * @param {Array} valoresPermitidos - Array com valores permitidos
 * @param {string} nomeCampo - Nome do campo para mensagem de erro
 * @returns {Object} - Objeto com propriedades 'valido' e 'msg'
 */
function validarValorPermitido(valor, valoresPermitidos, nomeCampo = 'Campo') {
    if (!valoresPermitidos.includes(valor)) {
        return { 
            valido: false, 
            msg: `${nomeCampo} inválido. Valores permitidos: ${valoresPermitidos.join(', ')}` 
        };
    }
    return { valido: true };
}

module.exports = {
    verificarCamposObrigatorios,
    validarNumero,
    validarValorPermitido
};