const request = require("supertest");
const app = require("../src/app");
const Chance = require("chance");
const chance = new Chance();

describe("Participante", () => {
    let token;
    let userId;
    let participanteId;

    // Cria usuário e faz login antes dos testes
    beforeAll(async () => {
        const email = chance.email();
        const senha = "senha123";
        const user = {
            nome: chance.name(),
            email,
            senha,
            telefone: "85999999999",
            dataNascimento: "01/01/2000",
            cidade: "Fortaleza",
            uf: "CE"
        };
        // Cria usuário
        await request(app).post("/v1/auth/register").send(user);
        // Faz login
        const res = await request(app).post("/v1/auth/login").send({ email, senha });
        token = res.body.token;
        // Decodifica o token para pegar o userId
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
        userId = payload.id;
    });

    test("Deve cadastrar um participante com sucesso", async () => {
        const participante = {
            nome_completo: chance.name(),
            cpf: "12345678901",
            email: chance.email(),
            telefone: "85988887777",
            data_nascimento: "10/10/2000",
            endereco: "Rua Teste, 123",
            cidade: "Fortaleza",
            uf: "CE"
        };
        const res = await request(app)
            .post("/v1/participante/cadastrar")
            .set("Authorization", `Bearer ${token}`)
            .send(participante);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("participante");
        participanteId = res.body.participante.id;
    });

    test("Deve buscar um participante cadastrado", async () => {
        const res = await request(app)
            .get(`/v1/participante/${participanteId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("participante");
        expect(res.body.participante.id).toBe(participanteId);
    });

    test("Deve atualizar dados do participante", async () => {
        const update = {
            nome_completo: "Nome Atualizado",
            email: chance.email(),
            cidade: "Sobral"
        };
        const res = await request(app)
            .put(`/v1/participante/atualizar/${participanteId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(update);
        expect(res.statusCode).toBe(200);
        expect(res.body.participante.nome_completo).toBe("Nome Atualizado");
    });

    test("Deve deletar o participante", async () => {
        const res = await request(app)
            .delete(`/v1/participante/deletar/${participanteId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.aviso).toMatch(/deletado com sucesso/i);
    });
});
