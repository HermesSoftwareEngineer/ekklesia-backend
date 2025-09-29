const request = require("supertest");
const app = require("../src/app");

describe('Eventos', () => {
    let tokenAdmin;
    let eventoId;

    // Credenciais de admin já existente
    const credenciaisAdmin = {
        email: "hermes123@gmail.com",
        senha: "hermes123"
    };

    // Evento base para testes
    const eventoBase = {
        titulo: "Congresso de Teste",
        percentual_desconto: 10,
        frase_destaque: "Evento imperdível!",
        descricao: "Descrição do evento de teste.",
        data_inicio: "2024-12-01",
        data_fim: "2024-12-03",
        horario_inicio: "08:00",
        horario_fim: "18:00",
        prazo_inscricao: "2024-11-25",
        abertura_inscricao: "2024-10-01",
        nome_local: "Centro de Eventos",
        endereco: "Rua Teste, 123",
        cidade_uf_id: 1,
        capacidade_total: 100,
        categoria_evento: "Congresso",
        tema_central: "Inovação",
        status: "ativo",
        link_lp: "https://evento.com",
        created_at: "2024-09-01",
        updated_at: "2024-09-01"
    };

    beforeAll(async () => {
        // Autentica como admin
        const res = await request(app)
            .post('/v1/auth/login')
            .send(credenciaisAdmin);
        tokenAdmin = res.body.token;
    });

    test("Criar evento (POST /v1/eventos) deve retornar 201", async () => {
        const res = await request(app)
            .post('/v1/eventos')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send(eventoBase);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        eventoId = res.body.id;
    });

    test("Listar eventos (GET /v1/eventos) deve retornar 200 e array", async () => {
        const res = await request(app)
            .get('/v1/eventos');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Buscar evento por ID (GET /v1/eventos/:id) deve retornar 200 e o evento", async () => {
        const res = await request(app)
            .get(`/v1/eventos/${eventoId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', eventoId);
    });

    test("Atualizar evento (PUT /v1/eventos/:id) deve retornar 200", async () => {
        const res = await request(app)
            .put(`/v1/eventos/${eventoId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({ ...eventoBase, titulo: "Congresso Atualizado" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('titulo', "Congresso Atualizado");
    });

    test("Deletar evento (DELETE /v1/eventos/:id) deve retornar 204", async () => {
        const res = await request(app)
            .delete(`/v1/eventos/${eventoId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`);
        expect(res.statusCode).toBe(204);
    });

    test("Buscar evento deletado deve retornar 404", async () => {
        const res = await request(app)
            .get(`/v1/eventos/${eventoId}`);
        expect(res.statusCode).toBe(404);
    });

    test("Criar evento sem campos obrigatórios deve retornar 400", async () => {
        const res = await request(app)
            .post('/v1/eventos')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({ titulo: "Faltando campos" });
        expect(res.statusCode).toBe(400);
    });

    test("Atualizar evento inexistente deve retornar 404", async () => {
        const res = await request(app)
            .put('/v1/eventos/999999')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send(eventoBase);
        expect(res.statusCode).toBe(404);
    });

    test("Deletar evento inexistente deve retornar 404", async () => {
        const res = await request(app)
            .delete('/v1/eventos/999999')
            .set('Authorization', `Bearer ${tokenAdmin}`);
        expect(res.statusCode).toBe(404);
    });
});
