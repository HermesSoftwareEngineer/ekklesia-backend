const request = require("supertest");
const app = require("../src/app");

// Biblioteca pra geração de strings (pra gerar e-mails aleatórios)
const Chance = require('chance')
const chance = new Chance()

describe('Autenticação', () => {
    // Código do conjunto de testes

    const credenciaisUsuario = {
        email: "hermes123@gmail.com",
        senha: "hermes123"
    };

    const minhaString = chance.string({ length: 10, pool: 'abcdefghijklmnopqrstuvwxyz'})
    const emailAleatorio = minhaString.concat('@gmail.com')

    const novoUsuario = {
        nome: "Hermes Barbosa Pereira",
        email: emailAleatorio,
        senha: "hermes123",
        telefone: "85 99668-8778",
        data_nascimento: "08/12/2004",
        endereco: "Via Paisagística, 80, ap. 503",
        cidade: "Fortaleza",
        uf: "CE"
    }

    let token;

    test("Login com credenciais válidas, deve retornar um token", async () => {
        const res = await request(app)
            .post('/v1/auth/login')
            .send(credenciaisUsuario)
        
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('token')

        token = res.body.token
    });

    test("Login com e-mail inexistente, deve retornar um erro 404", async () => {
        const res = await request(app)
            .post('/v1/auth/login')
            .send({email: "teste@gmail.com", senha: "teste123"})
        
        expect(res.statusCode).toBe(404)
    });

    test("Login com senha errada, deve retornar um erro 401", async () => {
        const res = await request(app)
            .post('/v1/auth/login')        
            .send({email: "hermes123@gmail.com", senha: "hermes124"})
        
        expect(res.statusCode).toBe(401)
    });

    test("Registro de novo usuário, deve retornar sucesso 201", async () => {
        const res = await request(app)
            .post("/v1/auth/register")
            .send(novoUsuario)

        expect(res.statusCode).toBe(201)
    });

    test("Registro de novo usuário sem dados obrigatórios, deve retornar um erro 400", async () => {
        const res = await request(app)
            .post("/v1/auth/register")
            .send({email: "hermes@gmail.com"})
        
        expect(res.statusCode).toBe(400)
    });

    test("Registro de usuário com e-mail já registrado, deve retornar um erro 409", async () => {
        const res = await request(app)
            .post("/v1/auth/register")
            .send(novoUsuario)

        expect(res.statusCode).toBe(409)
    });
});