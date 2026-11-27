require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');
require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log('Conexão com MySQL estabelecida!');

    await sequelize.sync();

    console.log('Tabelas criadas com sucesso!');

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();