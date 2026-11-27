
const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');

afterAll(async () => {
  await sequelize.close();
});

describe('Drip Store API', () => {
  it('deve responder corretamente na rota principal', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Drip Store API funcionando!',
    });
  });

  it('deve listar categorias com sucesso', async () => {
    const response = await request(app).get('/v1/category/search');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.data)).toBe(true);
  });


    it('deve bloquear criação de categoria sem token', async () => {
    const response = await request(app)
        .post('/v1/category')
        .send({
        name: 'Categoria Teste',
        slug: 'categoria-teste',
        use_in_menu: false,
        });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Token não informado.');
    });


    it('deve rejeitar login com senha incorreta', async () => {
    const response = await request(app)
        .post('/v1/user/token')
        .send({
        email: 'geandro.teste@example.com',
        password: 'SenhaIncorreta123',
        });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('E-mail ou senha inválidos.');
    });


});
