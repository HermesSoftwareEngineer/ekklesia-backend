/**
 * Módulo de validações para usuários
 * Contém funções de validação específicas para dados de usuários
 */

/**
 * Valida se uma data está no formato dd/mm/yyyy
 * @param {string} data - Data a ser validada
 * @returns {Object} - Objeto com propriedades 'valido' e 'msg'
 */
function validarFormatoData(data) {
    // Verifica se a data foi fornecida
    if (!data) {
        return { valido: false, msg: 'Data não fornecida!' };
    }

    // Verifica se é uma string
    if (typeof data !== 'string') {
        return { valido: false, msg: 'Data deve ser uma string!' };
    }

    // Verifica o formato dd/mm/yyyy usando regex
    const regexData = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = data.match(regexData);

    if (!match) {
        return { valido: false, msg: 'Data deve estar no formato dd/mm/yyyy!' };
    }

    // Extrai dia, mês e ano
    const dia = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10);
    const ano = parseInt(match[3], 10);

    // Valida os valores de mês
    if (mes < 1 || mes > 12) {
        return { valido: false, msg: 'Mês inválido! Deve estar entre 01 e 12.' };
    }

    // Valida os valores de dia conforme o mês
    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Verifica ano bissexto
    if ((ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0)) {
        diasPorMes[1] = 29; // Fevereiro em ano bissexto
    }

    if (dia < 1 || dia > diasPorMes[mes - 1]) {
        return { valido: false, msg: `Dia inválido para o mês ${mes}! Deve estar entre 01 e ${diasPorMes[mes - 1]}.` };
    }

    // Valida se o ano é razoável (não muito antigo nem no futuro)
    const anoAtual = new Date().getFullYear();
    if (ano < 1900 || ano > anoAtual) {
        return { valido: false, msg: `Ano inválido! Deve estar entre 1900 e ${anoAtual}.` };
    }

    return { valido: true, msg: 'Data válida!' };
}

/**
 * Converte data do formato dd/mm/yyyy para yyyy-mm-dd (formato do banco de dados)
 * @param {string} data - Data no formato dd/mm/yyyy
 * @returns {string} - Data no formato yyyy-mm-dd
 */
function converterDataParaBD(data) {
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
}

/**
 * Valida e converte uma data do formato dd/mm/yyyy
 * @param {string} data - Data a ser validada e convertida
 * @returns {Object} - Objeto com 'valido', 'msg' e 'dataConvertida'
 */
function validarEConverterData(data) {
    const validacao = validarFormatoData(data);
    
    if (!validacao.valido) {
        return validacao;
    }

    return {
        valido: true,
        msg: 'Data válida e convertida!',
        dataConvertida: converterDataParaBD(data)
    };
}

module.exports = {
    validarFormatoData,
    converterDataParaBD,
    validarEConverterData
};
