// ######
// Local onde os pacotes de dependências serão importados
// ######
import express from "express";      // Requisição do pacote do express
import pkg from "pg";               // Importa o PostgreSQL
import dotenv from "dotenv";        // Importa dotenv

dotenv.config();                     // Carrega e processa o arquivo .env
const { Pool } = pkg;                // Extrai a classe Pool do pg
const db = new Pool({  
  connectionString: process.env.URL_BD,
});

// ######
// Local onde as configurações do servidor serão feitas
// ######
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta

// ######
// Local onde as rotas (endpoints) serão definidas
// ######
app.get("/", async (req, res) => {        
  // Rota raiz do servidor
  // Rota GET /
  // Esta rota é chamada quando o usuário acessa a raiz do servidor
  // Ela retorna uma mensagem com informações do projeto

  console.log("Rota GET / solicitada"); // Log no terminal para indicar que a rota foi acessada

  // ######
  // Teste da conexão com o banco
  // ######
  let dbStatus = "ok";
  try {
    await db.query("SELECT 1");  // Tenta executar um SELECT simples
  } catch (e) {
    dbStatus = e.message;        // Caso dê erro, salva a mensagem
  }

  // Responde com um JSON contendo uma mensagem e status do BD
  res.json({
    descricao: "API para _____",    // Substitua pelo conteúdo da sua API
    autor: "Seu_nome_completo",     // Substitua pelo seu nome
    statusBD: dbStatus              // Informação do status do banco
  });
});

// ######
// Local onde o servidor escutar as requisições que chegam
// ######
app.listen(port, () => {
  console.log(`Serviço rodando na porta:  ${port}`);
});
