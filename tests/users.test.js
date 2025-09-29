const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/users.models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let adminToken;
let regularToken;
let testUserId;

// Mock de usuários para testes
const adminUser = {
    id: 1,
    nome: 'Admin Teste',
    email: 'admin@teste.com',
    senha: 'senha123',
    tipoUsuario: 'admin'
};

const regularUser = {
    id: 2,
    nome: 'Usuário Teste',
    email: 'usuario@teste.com',
    senha: 'senha123',
    tipoUsuario: 'user'
};

const newUser = {
    nome: 'Novo Usuário',
    email: 'novo@teste.com',
    senha: 'senha123',
    telefone: '11999998888',
    dataNascimento: '01/01/1990',
    cidade: 'São Paulo',
    uf: 'SP'
};

// Configuração antes dos testes
beforeAll(async () => {
    // Gerar tokens para os testes
    adminToken = jwt.sign(
        { id: adminUser.id, email: adminUser.email, tipoUsuario: adminUser.tipoUsuario },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
    );

    regularToken = jwt.sign(
        { id: regularUser.id, email: regularUser.email, tipoUsuario: regularUser.tipoUsuario },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
    );

    // Limpa e recria dados de teste no banco
    await User.destroy({ where: { email: [adminUser.email, regularUser.email, newUser.email] } });
    
    // Criar usuário admin
    const adminHash = await bcrypt.hash(adminUser.senha, 10);
    await User.create({
        nome: adminUser.nome,
        email: adminUser.email,
        senhaHash: adminHash,
        tipoUsuario: 'admin'
    });

    // Criar usuário regular
    const regularHash = await bcrypt.hash(regularUser.senha, 10);
    await User.create({
        nome: regularUser.nome,
        email: regularUser.email,
        senhaHash: regularHash,
        tipoUsuario: 'user'
    });
});

// Limpar dados após testes
afterAll(async () => {
    await User.destroy({ where: { email: [adminUser.email, regularUser.email, newUser.email] } });
});

// Testes para o endpoint de listagem de usuários
describe('GET /users/list', () => {
    it('deve listar todos os usuários quando autenticado', async () => {
        const res = await request(app)
            .get('/v1/users/list')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('usuarios');
        expect(Array.isArray(res.body.usuarios)).toBe(true);
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
        const res = await request(app).get('/v1/users/list');
        expect(res.statusCode).toEqual(401);
    });
});

// Testes para o endpoint de buscar usuário por ID
describe('GET /users/:id', () => {
    it('deve buscar um usuário por ID quando autenticado', async () => {
        // Primeiro encontrar o ID do usuário admin
        const userRes = await User.findOne({ where: { email: adminUser.email } });
        const userId = userRes.id;

        const res = await request(app)
            .get(`/v1/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('usuario');
        expect(res.body.usuario.email).toEqual(adminUser.email);
    });

    it('deve retornar 404 para usuário inexistente', async () => {
        const res = await request(app)
            .get('/v1/users/99999')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toEqual(404);
    });
});

// Testes para o endpoint de criação de usuário
describe('POST /users', () => {
    it('deve criar um novo usuário', async () => {
        const res = await request(app)
            .post('/v1/users')
            .send(newUser);
        
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('usuario');
        expect(res.body.usuario.email).toEqual(newUser.email);
        
        // Guardar o ID para usar nos próximos testes
        testUserId = res.body.usuario.id;
    });

    it('deve retornar erro para email duplicado', async () => {
        const res = await request(app)
            .post('/v1/users')
            .send(newUser);
        
        expect(res.statusCode).toEqual(409);
    });
});

// Testes para o endpoint de atualização de usuário
describe('PUT /users/:id', () => {
    it('deve atualizar um usuário existente', async () => {
        const updateData = {
            nome: 'Nome Atualizado',
            cidade: 'Rio de Janeiro'
        };

        const res = await request(app)
            .put(`/v1/users/${testUserId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updateData);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.usuario.nome).toEqual(updateData.nome);
        expect(res.body.usuario.cidade).toEqual(updateData.cidade);
    });

    it('deve retornar 404 ao atualizar usuário inexistente', async () => {
        const res = await request(app)
            .put('/v1/users/99999')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ nome: 'Teste' });
        
        expect(res.statusCode).toEqual(404);
    });
});

// Testes para o endpoint de exclusão de usuário
describe('DELETE /users/:id', () => {
    it('deve deletar um usuário existente', async () => {
        const res = await request(app)
            .delete(`/v1/users/${testUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toEqual(200);
        
        // Verificar se realmente foi deletado
        const checkUser = await User.findByPk(testUserId);
        expect(checkUser).toBeNull();
    });

    it('deve retornar 404 ao deletar usuário inexistente', async () => {
        const res = await request(app)
            .delete('/v1/users/99999')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toEqual(404);
    });
});