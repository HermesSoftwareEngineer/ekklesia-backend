// Validadores específicos para o tipo de vaga

// Validar campos obrigatórios
const validarCamposObrigatoriosTipoVaga = (dados, campos) => {
    const erros = [];

    campos.forEach(campo => {
        if (dados[campo] === undefined || dados[campo] === null || dados[campo] === '') {
            erros.push(`O campo '${campo}' é obrigatório.`);
        }
    });

    return erros;
};

// Validar os valores numéricos
const validarValoresNumericosTipoVaga = (dados) => {
    const erros = [];

    // Validação do preço
    if (dados.preco !== undefined && parseFloat(dados.preco) < 0) {
        erros.push('O preço não pode ser negativo.');
    }

    // Validação das quantidades
    if (dados.quantidade_total !== undefined && parseInt(dados.quantidade_total) < 0) {
        erros.push('A quantidade total não pode ser negativa.');
    }

    if (dados.quantidade_disponivel !== undefined && parseInt(dados.quantidade_disponivel) < 0) {
        erros.push('A quantidade disponível não pode ser negativa.');
    }

    if (dados.quantidade_total !== undefined && dados.quantidade_disponivel !== undefined && 
        parseInt(dados.quantidade_disponivel) > parseInt(dados.quantidade_total)) {
        erros.push('A quantidade disponível não pode ser maior que a quantidade total.');
    }

    return erros;
};

// Validar formato de data (dd/mm/aaaa)
const validarFormatoData = (dataString) => {
    if (!dataString) return true; // Se não tiver data, não precisa validar formato
    
    // Regex para validar formato dd/mm/aaaa
    const regexData = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    
    return regexData.test(dataString);
};

// Função para converter data de dd/mm/aaaa para yyyy-mm-dd (formato do banco)
const converterFormatoData = (dataString) => {
    if (!dataString) return null;
    
    const [dia, mes, ano] = dataString.split('/');
    return `${ano}-${mes}-${dia}`;
};

// Validar datas
const validarDatasTipoVaga = (dados) => {
    const erros = [];
    
    // Verificar formato das datas (dd/mm/aaaa)
    if (dados.data_inicio && !validarFormatoData(dados.data_inicio)) {
        erros.push('O formato da data de início deve ser dd/mm/aaaa.');
        return erros; // Retorna cedo se o formato estiver incorreto
    }
    
    if (dados.data_fim && !validarFormatoData(dados.data_fim)) {
        erros.push('O formato da data de fim deve ser dd/mm/aaaa.');
        return erros; // Retorna cedo se o formato estiver incorreto
    }
    
    // Se os formatos estiverem corretos, converte para objeto Date para validações adicionais
    let dataInicio = null;
    let dataFim = null;
    
    if (dados.data_inicio) {
        const [dia, mes, ano] = dados.data_inicio.split('/');
        dataInicio = new Date(ano, mes - 1, dia); // mês em JS é 0-indexed
        
        // Verifica se é uma data válida
        if (isNaN(dataInicio.getTime())) {
            erros.push('A data de início é inválida.');
        }
    }
    
    if (dados.data_fim) {
        const [dia, mes, ano] = dados.data_fim.split('/');
        dataFim = new Date(ano, mes - 1, dia); // mês em JS é 0-indexed
        
        // Verifica se é uma data válida
        if (isNaN(dataFim.getTime())) {
            erros.push('A data de fim é inválida.');
        }
    }
    
    // Verificar se data_fim é posterior a data_inicio
    if (dataInicio && dataFim && dataFim < dataInicio) {
        erros.push('A data de fim deve ser posterior à data de início.');
    }
    
    return erros;
};

module.exports = {
    validarCamposObrigatoriosTipoVaga,
    validarValoresNumericosTipoVaga,
    validarDatasTipoVaga,
    validarFormatoData,
    converterFormatoData
};