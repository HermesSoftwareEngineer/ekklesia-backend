// Validações para cadastro de evento

function validarDatasEvento({ data_inicio, data_fim, prazo_inscricao, abertura_inscricao }) {
    const datas = [data_inicio, data_fim, prazo_inscricao, abertura_inscricao].map(d => new Date(d));
    if (datas.some(d => isNaN(d.getTime()))) {
        return { valido: false, msg: 'Uma ou mais datas estão em formato inválido.' };
    }
    if (datas[0] > datas[1]) {
        return { valido: false, msg: 'Data de início não pode ser maior que data de fim.' };
    }
    if (datas[2] > datas[0]) {
        return { valido: false, msg: 'Prazo de inscrição não pode ser após a data de início.' };
    }
    if (datas[3] > datas[2]) {
        return { valido: false, msg: 'Abertura de inscrição não pode ser após o prazo de inscrição.' };
    }
    return { valido: true };
}

function validarCamposObrigatoriosEvento(obj, campos = []) {
    const erros = [];
    campos.forEach(campo => {
        if (!obj[campo]) erros.push(`Campo ${campo} faltando!`);
    });
    return erros;
}

function validarStatusEvento(status) {
    const validos = ['Ativo', 'Rascunho', 'Desativado', 'Encerrado', 'Cancelado'];
    if (!validos.includes(status)) {
        return { valido: false, msg: 'Status do evento inválido.' };
    }
    return { valido: true };
}

function validarCapacidade(capacidade_total) {
    if (typeof capacidade_total !== 'number' || capacidade_total <= 0) {
        return { valido: false, msg: 'Capacidade total deve ser um número positivo.' };
    }
    return { valido: true };
}

function validarDataEvento(data) {
    const regexBR = /^([0-2][0-9]|3[0-1])\/(0[0-9]|1[0-2])\/\d{4}$/;
    if (!regexBR.test(data)) {
        return { valido: false, msg: "Formato de data inválido! O formato deve ser dd/mm/aaaa." };
    }
    const [dia, mes, ano] = data.split("/").map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    const anoValidado = dataObj.getFullYear() === ano;
    const mesValidado = dataObj.getMonth() === mes - 1;
    const diaValidado = dataObj.getDate() === dia;
    if (!anoValidado || !mesValidado || !diaValidado) {
        return { valido: false, msg: "Data inválida!" };
    }
    return { valido: true };
}

module.exports = {
    validarDatasEvento,
    validarCamposObrigatoriosEvento,
    validarStatusEvento,
    validarCapacidade,
    validarDataEvento
};

