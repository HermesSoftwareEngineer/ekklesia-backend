const { isNumericString }= require("../utils/strings.utils");
const Participante = require("../models/participante.models");

function validarCPF (cpf) {
    if ((cpf.length != 11) || !isNumericString(cpf)) {
        return {valido: false, msg: "O CPF precisa ter 11 dígitos e conter apenas números"};
    };
    return {valido: true};
};

function validarUF (uf) {
    if (uf.length != 2) {
        return {valido: false, msg: "O UF precisa ter 2 dígitos"};
    };
    return {valido: true};
};

function validarData(data) {

    // Valida o formato da data
    const regexBR = /^([0-2][0-9]|3[0-1])\/(0[0-9]|1[0-2])\/\d{4}$/

    if (regexBR.test(data)) {
        [dia, mes, ano] = data.split("/").map(Number);
    } else {
        return {valido: false, msg: "Formato de data inválido! O formato deve ser dd/mm/aaaa."}
    };
    
    // Verifica se a data é válida (se a data existe)
    const dataObj = new Date(ano, mes - 1, dia);

    const anoValidado = dataObj.getFullYear() === ano;
    const mesValidado = dataObj.getMonth() === mes;
    const diaValidado = dataObj.getDay() === dia;

    if (!anoValidado || mesValidado || diaValidado) {
        return {valido: false, msg: "Data inválida!"};
    };

    return {valido: true};
};

function validarEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(email)) {
        return {valido: false, msg: "E-mail no formato errado!"};
    };

    return {valido: true};
};

async function validarIdParticipante (id) {
    const participante = await Participante.findByPk(id);

    if (!participante) {
        return {valido: false, msg: "Participante não encontrado!"};
    };

    return {valido: true}
};

function verificarCamposObrigatorios (obj, campos = []) {
    const erros = [];

    campos.forEach((campo) => {
        if (!obj[campo]) {
            erros.push(`Campo ${campo} faltando!`)
        };
    });
    
    return erros;
};

module.exports = { validarCPF, verificarCamposObrigatorios, validarUF, validarData, validarEmail, validarIdParticipante }