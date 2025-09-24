// ######
// Local onde os pacotes de dependências serão importados
// ######
import express from "express"; // Requisição do pacote do express
import pkg from "pg"; // Requisição do pacote do pg (PostgreSQL)
import dotenv from "dotenv"; // Importa o pacote dotenv para carregar variáveis de ambiente

// ######
// Local onde as configurações do servidor serão feitas
// ######
const app = express(); // Inicializa o servidor Express
const port = 3000; // Define a porta onde o servidor irá escutar
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const { Pool } = pkg; // Obtém o construtor Pool do pacote pg para gerenciar conexões
let pool = null; // Variável para armazenar o pool de conexões com o banco de dados

// ######
// Função para obter uma conexão com o banco de dados
// ######
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD, // Usa a string do .env
    });
  }
  return pool;
}

// ######
// Local onde as rotas (endpoints) serão definidas
// ######

// Rota raiz GET /
app.get("/", async (req, res) => {
  console.log("Rota GET / solicitada");

  const db = conectarBD(); // Usa a função para obter a conexão
  let dbStatus = "ok";

  try {
    await db.query("SELECT 1"); // Testa conexão
  } catch (e) {
    dbStatus = e.message;
  }

  res.json({
    message: "API para _____", // Substitua pelo conteúdo da sua API
    author: "Seu_nome_completo", // Substitua pelo seu nome
    dbStatus: dbStatus,
  });
});

// Rota GET /questoes
app.get("/questoes", async (req, res) => {
  console.log("Rota GET /questoes solicitada");

  const db = conectarBD(); // Usa a função para obter a conexão

  try {
    const resultado = await db.query("SELECT * FROM questoes"); // Executa a consulta
    const dados = resultado.rows;
    res.json(dados);
  } catch (e) {
    console.error("Erro ao buscar questões:", e);
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});

// ######
// Local onde o servidor irá escutar as requisições
// ######
app.listen(port, () => {
  console.log(`Serviço rodando na porta: ${port}`);
});
